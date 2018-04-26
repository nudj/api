const find = require('lodash/find')
const DataLoader = require('dataloader')

module.exports = (db, cache) => type => {
  if (!cache[type]) {
    cache[type] = new DataLoader(async keys => {
      const items = await db.collection(type).lookupByKeys(keys)
      return keys.map(key => find(items, { _key: key }))
    })
  }
  return cache[type]
}
