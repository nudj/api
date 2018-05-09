const uuid = require('uuid/v4')
const pick = require('lodash/pick')
const mapValues = require('lodash/mapValues')
const promiseSerial = require('promise-serial')
const {
  TABLE_ORDER,
  RELATIONS,
  tableToCollection,
  dateToTimestamp
} = require('./helpers')
const {
  FIELDS
} = require('../../lib/sql')

async function action ({ db, sql }) {
  const idMaps = {}
  await promiseSerial(TABLE_ORDER.map(tableName => async () => {
    idMaps[tableName] = {}
    const collectionName = tableToCollection(tableName)
    const collectionCursor = db.collection(collectionName)
    const collectionCursorAll = await collectionCursor.all()
    const items = await collectionCursorAll.all()
    await promiseSerial(items.map(item => async () => {
      const id = uuid()
      const scalars = pick(item, Object.values(FIELDS[tableName]))
      const relations = mapValues(RELATIONS[tableName] || {}, (foreignTable, field) => idMaps[foreignTable][item[field]])
      await sql(tableName).insert({
        id,
        created: dateToTimestamp(item.created),
        modified: dateToTimestamp(item.modified),
        ...scalars,
        ...relations
      })
      idMaps[tableName][item._key] = id
    }))
  }))
}

module.exports = action
