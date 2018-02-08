const { collections } = require('./db')

const setupDatabase = async (db) => {
  return Promise.all(collections.map(async collectionName => {
    let collection
    try {
      collection = db.collection(collectionName)
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name: duplicate name') throw error
    }
    return collection.truncate()
  }))
}

module.exports = setupDatabase
