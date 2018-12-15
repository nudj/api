const DataLoader = require('dataloader')
const keyBy = require('lodash/keyBy')
const zipObject = require('lodash/zipObject')
const {
  INDICES,
  getIndexKey
} = require('../../../lib/sql')

module.exports = (db, cache) => ({
  type,
  index,
  transaction
}) => {
  console.log(1)
  index = index || INDICES[type].id
  console.log(2, 'index', index)
  const {
    name: indexName,
    fields: indexFields
  } = index
  console.log(3, 'indexName indexFields', indexName, indexFields)
  if (!cache[indexName]) {
    console.log(4, 'fetch dataloader', indexName)
    cache[indexName] = new DataLoader(async keys => {
      console.log(5, 'fetch keys', type, keys)
      if (indexFields.length === 1) {
        console.log(6)
        let records
        console.log(7)
        const field = indexFields[0]
        console.log(8)
        if (transaction) {
          console.log(9)
          records = await db.select().from(type).transacting(transaction).whereIn(field, keys)
        } else {
          console.log(10)
          records = await db.select().from(type).whereIn(field, keys)
        }
        console.log(11, 'records', type, records)
        const recordsMap = keyBy(records, field)
        console.log(12, 'recordsMap', type, recordsMap)
        return keys.map(key => recordsMap[key] || null)
      } else {
        console.log(13)
        const records = await db.select().from(type).where(builder => {
          console.log(14)
          const filterSets = keys.map(key => zipObject(indexFields, key.split('|')))
          console.log(15)
          filterSets.forEach((filterSet, index) => {
            console.log(16)
            if (index) {
              console.log(17)
              builder.orWhere(filterSet)
            } else {
              console.log(18)
              builder.where(filterSet)
            }
          })
        })
        console.log(19)
        const recordsMap = keyBy(records, record => getIndexKey(index, record))
        console.log(20)
        return keys.map(key => recordsMap[key] || null)
      }
    })
  }
  console.log(21)
  return cache[indexName]
}
