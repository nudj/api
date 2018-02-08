const { collections } = require('./db')

const truncateDatabase = (db) => {
  return Promise.all(collections.map(collectionName => {
    const collection = db.collection(collectionName)
    return collection.truncate()
  }))
}

module.exports = truncateDatabase
