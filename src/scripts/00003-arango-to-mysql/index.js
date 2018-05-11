const uuid = require('uuid/v4')
const invert = require('lodash/invert')
const map = require('lodash/map')
const mapValues = require('lodash/mapValues')
const promiseSerial = require('promise-serial')
const {
  TABLE_ORDER,
  RELATIONS,
  SELF_RELATIONS,
  MANY_RELATIONS,
  tableToCollection,
  dateToTimestamp
} = require('./helpers')
const {
  TABLES,
  FIELDS
} = require('../../lib/sql')

async function action ({ db, sql, nosql }) {
  const idMaps = {}

  // loop over sql tables in specific order to comply with foreign key contraints
  await promiseSerial(TABLE_ORDER.map(tableName => async () => {
    idMaps[tableName] = {}

    // fetch all items from the corresponding Arango collection
    const collectionName = tableToCollection(tableName)
    const collectionCursor = db.collection(collectionName)
    const collectionCursorAll = await collectionCursor.all()
    const items = await collectionCursorAll.all()

    console.log(tableName, items.length)
    // loop over every item in the corresponding Arango collection
    await promiseSerial(items.map(item => async () => {
      const id = uuid()
      const scalars = mapValues(invert(FIELDS[tableName]), (ignore, field) => {
        const value = item[field]
        return typeof value === 'object' ? JSON.stringify(value) : value
      })
      const relations = mapValues(RELATIONS[tableName] || {}, (foreignTable, field) => idMaps[foreignTable][item[field]])

      try {
        // create new record in MySQL table
        await sql(tableName).insert({
          id,
          created: dateToTimestamp(item.created),
          modified: dateToTimestamp(item.modified),
          ...scalars,
          ...relations
        })
      } catch (error) {
        console.log(tableName, item, RELATIONS[tableName], scalars, relations)
        throw error
      }

      // cache map from Arango id to MySQL id for the given table
      idMaps[tableName][item._key] = id

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
              id: uuid(),
              created: dateToTimestamp(item.modified),
              modified: dateToTimestamp(item.modified),
              ...edgeRelations
            })
          }))
        }))
      }
    }))

    // retroactively update records with relations that reference the same table (because we need to know the id of the record we are referencing)
    if (SELF_RELATIONS[tableName]) {
      await promiseSerial(items.map(item => async () => {
        const selfRelations = SELF_RELATIONS[tableName].reduce((selfRelations, field) => {
          const value = idMaps[tableName][item[field]]
          if (value) {
            selfRelations[field] = value
          }
          return selfRelations
        }, {})
        if (Object.keys(selfRelations).length) {
          const recordId = idMaps[tableName][item._key]
          await sql(tableName).where('id', '=', recordId).update(selfRelations)
        }
      }))
    }
  }))

  // loop over referral key->id map and store in NoSQL store to help with old url remapping
  const referralIdMapsCursor = await nosql.collection('referralIdMaps')
  await promiseSerial(map(idMaps[TABLES.REFERRALS], (id, _key) => () => referralIdMapsCursor.save({ _key, id })))
}

module.exports = action
