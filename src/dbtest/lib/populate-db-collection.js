const { collections } = require('./db')

const populateDbCollection = async (db, collectionName, collectionData) => {
  const collection = await db.collection(collectionName)
  return Promise.all(collectionData.map(data => collection.save(data)))
}

module.exports = populateDbCollection
