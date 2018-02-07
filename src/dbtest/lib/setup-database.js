const collections = require('./collections')

const setupDatabase = async (db) => {
  try {
    await db.createDatabase('test')
  } catch (error) {
    if (
      error.message !== 'duplicate name' &&
      error.message !== 'operation only allowed in system database'
    ) {
      throw error
    }
  }
  await db.useDatabase('test')
  return Promise.all(collections.map(async collectionName => {
    let collection
    try {
      collection = db.collection(collectionName)
      await collection.create()
    } catch (error) {
      if (error.message !== 'duplicate name') throw error
    }
    return collection.truncate()
  }))
}

module.exports = setupDatabase
