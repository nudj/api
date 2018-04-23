const DataLoader = require('dataloader')

module.exports = (db, cache) => type => {
  if (!cache[type]) {
    cache[type] = new DataLoader(keys => db.collection(type).lookupByKeys(keys))
  }
  return cache[type]
}
