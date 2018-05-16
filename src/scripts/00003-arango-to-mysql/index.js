const reduce = require('lodash/reduce')
const map = require('lodash/map')
const mapValues = require('lodash/mapValues')
const promiseSerial = require('promise-serial')
const {
  OLD_COLLECTIONS,
  NEW_COLLECTIONS,
  TABLE_ORDER,
  RELATIONS,
  SELF_RELATIONS,
  MANY_RELATIONS,
  SLUG_GENERATORS,
  newToOldCollection,
  fieldToProp,
  dateToTimestamp
} = require('./helpers')
const {
  TABLES,
  FIELDS
} = require('../../lib/sql')

async function action ({ db, sql, nosql }) {
  const idMaps = {}
  const slugMaps = {}

  // loop over sql tables in specific order to comply with foreign key contraints
  await promiseSerial(TABLE_ORDER.map(tableName => async () => {
    const slugConfig = SLUG_GENERATORS[tableName]
    idMaps[tableName] = {}
    slugMaps[tableName] = {}

    // fetch all items from the corresponding Arango collection
    const collectionName = tableName
    const collectionCursor = db.collection(collectionName)
    const collectionCursorAll = await collectionCursor.all()
    const items = await collectionCursorAll.all()

    // loop over every item in the corresponding Arango collection
    await promiseSerial(items.map(item => async () => {
      const scalars = reduce(FIELDS[tableName], (scalars, field) => {
        const value = item[fieldToProp(tableName, field)]
        scalars[field] = typeof value === 'object' ? JSON.stringify(value) : value
        return scalars
      }, {})
      const relations = mapValues(RELATIONS[tableName] || {}, (foreignTable, field) => idMaps[foreignTable][item[fieldToProp(tableName, field)]])

      // prepare insert data
      const data = {
        created: dateToTimestamp(item.created),
        modified: dateToTimestamp(item.modified),
        ...scalars,
        ...relations
      }

      // if required generate slug
      if (slugConfig) {
        data.slug = slugConfig.generator(data)
      }

      // create new record in MySQL table
      let id
      // loop to allow for slug clashes
      while (!id) {
        try {
          [ id ] = await sql(tableName).insert(data)
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            const index = error.sqlMessage.split("'").splice(-2, 1)[0]
            if (slugConfig && slugConfig.index && index && index === slugConfig.index) {
              // refresh slug when former slug clashes
              data.slug = slugConfig.generator(data, true)
            } else {
              // not a slug clash so throw
              throw error
            }
          } else {
            // not a duplicate entry error so throw
            throw error
          }
        }
      }

      // cache map from Arango key to MySQL id for the given table
      idMaps[tableName][item._key] = id

      // if required cache map from Arango key to slug for the given table
      if (slugConfig) {
        slugMaps[tableName][item._key] = data.slug
      }

      // create edge records for one->many relationships (which are stored as Array<key>'s in Arango and are unsupported in MySQL)
      if (MANY_RELATIONS[tableName]) {
        // loop over the fields that hold one->many relations
        await promiseSerial(map(MANY_RELATIONS[tableName], (edgeRelation, field) => async () => {
          const {
            tableName: edgeTableName,
            relations
          } = edgeRelation

          // loop over every key in the one->many Array<key>
          await promiseSerial(item[field].map(childKey => async () => {
            // fetch the id mapping for the edge record foreign keys
            const edgeRelations = mapValues(relations, foreignTableName => {
              const key = foreignTableName === tableName ? item._key : childKey
              return idMaps[foreignTableName][key]
            })

            // create a new edge record in the edge table
            await sql(edgeTableName).insert({
              created: dateToTimestamp(item.created),
              modified: dateToTimestamp(item.modified),
              ...edgeRelations
            })
          }))
        }))
      }
    })) // items.map

    // retroactively update records with relations that reference the same table (because we need to know the id of the record we are referencing)
    if (SELF_RELATIONS[tableName]) {
      await promiseSerial(items.map(item => async () => {
        const selfRelations = SELF_RELATIONS[tableName].reduce((selfRelations, field) => {
          const id = idMaps[tableName][item[field]]
          if (id) {
            selfRelations[field] = id
          }
          return selfRelations
        }, {})
        if (Object.keys(selfRelations).length) {
          const recordId = idMaps[tableName][item._key]
          await sql(tableName).where('id', '=', recordId).update(selfRelations)
        }
      }))
    }
  })) // TABLE_ORDER.map

  // create currentEmployments
  const employmentsCursor = db.collection(OLD_COLLECTIONS.EMPLOYMENTS)
  const employmentsCurrentCursor = await employmentsCursor.byExample({
    current: true
  })
  const employmentsCurrent = await employmentsCurrentCursor.all()
  await promiseSerial(employmentsCurrent.map(employment => async () => {
    await sql(TABLES.CURRENT_EMPLOYMENTS).insert({
      created: dateToTimestamp(employment.created),
      modified: dateToTimestamp(employment.modified),
      employment: idMaps[TABLES.EMPLOYMENTS][employment._key],
      person: idMaps[TABLES.PEOPLE][employment.person]
    })
  }))

  // copy events into jobViewEvents collection in NoSQL
  await promiseSerial(Object.values(NEW_COLLECTIONS).map(newCollectionName => async () => {
    // create new collection
    const newCollectionCursor = await nosql.collection(newCollectionName)
    await newCollectionCursor.create()

    // fetch all items from old collection
    const oldCollectionName = newToOldCollection(newCollectionName)
    const oldCollectionCursor = db.collection(oldCollectionName)
    const oldCollectionCursorAll = await oldCollectionCursor.all()
    const oldItems = await oldCollectionCursorAll.all()

    // copy values from old items to new items
    await promiseSerial(oldItems.map(oldItem => async () => {
      let props
      switch (newCollectionName) {
        case NEW_COLLECTIONS.JOB_VIEW_EVENTS:
          props = {
            created: dateToTimestamp(oldItem.created),
            modified: dateToTimestamp(oldItem.modified),
            job: idMaps[TABLES.JOBS][oldItem.entityId],
            browserId: oldItem.browserId
          }
          break
      }
      await newCollectionCursor.save(props)
    }))
  }))

  // loop over referral key->slug and store in NoSQL store to help with old url remapping
  const referralKeyToSlugMapsCursor = await nosql.collection('referralKeyToSlugMaps')
  await referralKeyToSlugMapsCursor.create()
  await promiseSerial(map(slugMaps[TABLES.REFERRALS], (slug, _key) => () => referralKeyToSlugMapsCursor.save({ _key, slug })))
}

module.exports = action
