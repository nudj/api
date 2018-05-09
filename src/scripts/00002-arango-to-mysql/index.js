const uuid = require('uuid/v4')
const pick = require('lodash/pick')
const promiseSerial = require('promise-serial')
const {
  TABLE_ORDER,
  tableToCollection,
  dateToTimestamp
} = require('./helpers')
const {
  FIELDS
} = require('../../lib/sql')

async function action ({ db, sql }) {
  const idMaps = {}
  await promiseSerial(TABLE_ORDER.map(tableName => async () => {
    // try {
      idMaps[tableName] = {}
      const collectionName = tableToCollection(tableName)
      const collectionCursor = db.collection(collectionName)
      const collectionCursorAll = await collectionCursor.all()
      const items = await collectionCursorAll.all()
      await promiseSerial(items.map(item => async () => {
        const id = uuid()
        await sql(tableName).insert({
          id,
          created: dateToTimestamp(item.created),
          modified: dateToTimestamp(item.modified),
          ...pick(item, Object.values(FIELDS[tableName]))
        })
        idMaps[tableName][item._key] = id
      }))
    // } catch (error) {
    //   console.log(error)
    // }
  }))
  // console.log('idMaps', idMaps)
}

module.exports = action
