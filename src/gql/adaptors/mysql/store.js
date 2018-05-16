const omit = require('lodash/omit')
const setupDataLoaderCache = require('./setup-dataloader-cache')

module.exports = ({ db }) => {
  const getDataLoader = setupDataLoaderCache(db, {})

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
    filters,
    filter
  }) => {
    filters = filters || filter
    switch (true) {
      case !!id:
        return getDataLoader({ type }).load(id)
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

  const importRecords = async ({
    type,
    index,
    data
  }) => {
    // using transaction as need to guarantee sequential ids when inserting new items
    let { records, lastId } = await db.transaction(async transaction => {
      const dataLoader = getDataLoader({
        type,
        index,
        transaction
      })

      // fetch all existing records returning a null where a record does not already exist
      // crucially it preserves the order as defined by `data`
      const records = await dataLoader.loadMany(data.map(item => item[index.fields]))

      // array of data items corresponding with null entries in the `records` array above
      const newData = records.reduce((newData, record, index) => {
        if (!record) {
          newData = newData.concat(data[index])
        }
        return newData
      }, [])

      // insert new data into the db
      await transaction(type).insert(newData)

      // fetch the id of the first new record created by the above insert
      const [ [ { lastId } ] ] = await transaction.raw('SELECT LAST_INSERT_ID() AS lastId;')

      return {
        records,
        lastId
      }
    })

    // return array of ids (existing or newly inserted) in requested order
    return records.map(record => (record && record.id) || lastId++)
  }

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
