const setupCollections = async (db, collections) => {
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

const populateCollections = (db, allCollectionData) => {
  return Promise.all(allCollectionData.map(async collectionData => {
    const collection = await db.collection(collectionData.name)
    return collection.import(collectionData.data)
  }))
}

module.exports = { setupCollections, populateCollections }
