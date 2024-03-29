const omit = require('lodash/omit')
const isNull = require('lodash/isNull')
const isObject = require('lodash/isObject')
const findIndex = require('lodash/findIndex')
const times = require('lodash/times')

const setupDataLoaderCache = require('./setup-dataloader-cache')
const {
  INDICES,
  getIndexKey
} = require('../../../lib/sql')
const makeSlug = require('../../lib/helpers/make-slug')

module.exports = ({ db }) => {
  const getDataLoader = setupDataLoaderCache(db, {})

  const overrideableTransaction = action => async args => {
    if (args.transaction) {
      return action(args)
    } else {
      return db.transaction(transaction => {
        return action({
          ...args,
          transaction
        })
      })
    }
  }

  const create = async ({
    type,
    data
  }) => {
    const [ id ] = await db(type).insert(data)
    return getDataLoader({ type }).load(id)
  }

  const readOne = async ({
    type,
    id,
    index,
    key,
    filters,
    filter
  }) => {
    filters = filters || filter
    switch (true) {
      case !!id:
        return getDataLoader({ type }).load(id)
      case !!index && !!key:
        return getDataLoader({ type, index }).load(key)
      case !!filters:
        const record = await db.first().from(type).where(filters)
        if (record) getDataLoader({ type }).prime(record.id, record)
        return record || null
      default:
        return null
    }
  }

  const readMany = async ({
    type,
    ids
  }) => {
    if (!ids) return null
    const dataLoader = getDataLoader({ type })
    return dataLoader.loadMany(ids)
  }

  const readAll = async ({
    type,
    filters,
    filter
  }) => {
    let records
    const dataLoader = getDataLoader({ type })
    filters = filters || filter
    switch (true) {
      case !!filters && !!filters.dateFrom && !!filters.dateTo:
        records = await db
          .select()
          .from(type)
          .where('created', '>=', filters.dateFrom)
          .where('created', '<=', filters.dateTo)
          .where(omit(filters, ['dateFrom', 'dateTo']))
        break
      case !!filters && !!filters.dateFrom:
        records = await db
          .select()
          .from(type)
          .where('created', '>=', filters.dateFrom)
          .where(omit(filters, ['dateFrom']))
        break
      case !!filters && !!filters.dateTo:
        records = await db
          .select()
          .from(type)
          .where('created', '<=', filters.dateTo)
          .where(omit(filters, ['dateTo']))
        break
      case !!filters:
        records = await db.select().from(type).where(filters)
        break
      default:
        records = await db.select().from(type)
        break
    }
    records.forEach(record => dataLoader.prime(record.id, record))
    return records
  }

  const update = async ({
    type,
    id,
    data
  }) => {
    await db(type).where({ id }).update(data)
    const record = db.first().from(type).where({ id })
    if (record) getDataLoader({ type }).prime(record.id, record)
    return record
  }

  const deleteRecord = async ({
    type,
    id
  }) => {
    const record = await db.first().from(type).where({ id })
    await db(type).where({ id }).del()
    if (record) getDataLoader({ type }).clear(id)
    return record || null
  }

  const readOneOrCreate = async ({
    type,
    filters,
    filter,
    data
  }) => {
    let record = await readOne({
      type,
      filters,
      filter
    })
    if (!record) {
      record = await create({
        type,
        data
      })
    }
    return record
  }

  const count = async ({
    type,
    filters,
    filter
  }) => {
    let count
    filters = filters || filter
    switch (true) {
      case !!filters && !!filters.dateFrom && !!filters.dateTo:
        [ { count } ] = await db(type).count('id as count')
          .where('created', '>=', filters.dateFrom)
          .where('created', '<=', filters.dateTo)
          .where(omit(filters, ['dateFrom', 'dateTo']))
        break
      case !!filters && !!filters.dateFrom:
        [ { count } ] = await db(type).count('id as count')
          .where('created', '>=', filters.dateFrom)
          .where(omit(filters, ['dateFrom']))
        break
      case !!filters && !!filters.dateTo:
        [ { count } ] = await db(type).count('id as count')
          .where('created', '<=', filters.dateTo)
          .where(omit(filters, ['dateTo']))
        break
      case !!filters:
        [ { count } ] = await db(type).count('id as count').where(filters)
        break
      default:
        [ { count } ] = await db(type).count('id as count')
        break
    }
    return count
  }

  const getSlugClashes = ({
    recordsByField,
    recordsBySlug
  }) => {
    return recordsBySlug.reduce((clashes, record, index) => {
      if (isNull(recordsByField[index]) && isObject(record)) {
        clashes = clashes.concat({
          index,
          record
        })
      }
      return clashes
    }, [])
  }

  // using transaction as need to guarantee sequential ids when inserting new items
  const importRecords = overrideableTransaction(async ({
    type,
    index,
    slugIndex,
    data,
    transaction
  }) => {
    index = index || INDICES[type].id

    const dataLoaderByField = getDataLoader({
      type,
      index,
      transaction
    })
    // fetch all existing records returning a null where a record does not already exist
    // crucially it preserves the order as defined by `data`
    const recordsByField = await dataLoaderByField.loadMany(data.map(item => getIndexKey(index, item)))

    // if is a slug index then we need to make sure there are no slug clashes
    if (slugIndex) {
      const dataLoaderBySlug = getDataLoader({
        type,
        index: slugIndex,
        transaction
      })
      let recordsBySlug = await dataLoaderBySlug.loadMany(data.map(item => getIndexKey(slugIndex, item)))
      let clashes = getSlugClashes({ recordsByField, recordsBySlug })
      while (clashes.length) {
        clashes.forEach(clash => {
          data[clash.index].slug = makeSlug(data[clash.index].name, true)
        })
        recordsBySlug = await dataLoaderBySlug.loadMany(data.map(item => getIndexKey(slugIndex, item)))
        clashes = getSlugClashes({ recordsByField, recordsBySlug })
      }
    }

    // array of data items corresponding with null entries in the `recordsByField` array above
    const newData = recordsByField.reduce((newData, record, i) => {
      const originalData = data[i]
      if (!record) {
        // check if the item already exists in the dedupedData
        let indexInDedupedData = findIndex(newData.dedupedData, item => getIndexKey(index, item) === getIndexKey(index, originalData))
        // if record does not already exists in dedupedData
        if (indexInDedupedData < 0) {
          // add the data to the dedupedData for insertion
          newData.dedupedData = newData.dedupedData.concat(originalData)
          // set the index of this item so it can be restored in the correct place
          indexInDedupedData = newData.dedupedData.length - 1
        }
        // cache the index of the record in dedupedData so it can be restored into the correct place later
        newData.orderCache = newData.orderCache.concat(indexInDedupedData)
      }
      return newData
    }, {
      dedupedData: [],
      orderCache: []
    })

    // insert new data into the db
    await transaction(type).insert(newData.dedupedData)

    // fetch the id of the first new record created by the above insert
    let [ [ { lastId } ] ] = await transaction.raw('SELECT LAST_INSERT_ID() AS lastId;')

    // generate the ids of the newly inserted records
    const insertedRecordIds = times(newData.dedupedData.length, time => lastId + time)

    // map the generated ids back into the order they were passed into the resolver
    const orderedInsertedRecordIds = newData.orderCache.map(index => insertedRecordIds[index])

    // return array of ids (existing or newly inserted) in requested order
    return recordsByField.map(record => (record && record.id) || orderedInsertedRecordIds.shift())
  })

  return {
    create,
    readOne,
    readMany,
    readAll,
    update,
    delete: deleteRecord,
    readOneOrCreate,
    count,
    import: importRecords
  }
}
