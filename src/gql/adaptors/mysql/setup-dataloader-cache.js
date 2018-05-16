const DataLoader = require('dataloader')
const keyBy = require('lodash/keyBy')
const { INDICES } = require('../../../lib/sql')

module.exports = (db, cache) => ({
  type,
  index,
  transaction
}) => {
  index = index || INDICES[type].id
  const {
    name: indexName,
    fields: indexFields
  } = index
  if (!cache[indexName]) {
    cache[indexName] = new DataLoader(async keys => {
      if (indexFields.length === 1) {
        let records
        const field = indexFields[0]
        if (transaction) {
          records = await db.select().from(type).transacting(transaction).whereIn(field, keys)
        } else {
          records = await db.select().from(type).whereIn(field, keys)
        }
        const recordsMap = keyBy(records, field)
        return keys.map(key => recordsMap[key] || null)
      } else {
        throw new Error('Multi field indices are not supported yet!')
      }
    })
  }
  return cache[indexName]
}
