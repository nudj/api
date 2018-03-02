const truncateCollections = (db, collections) => {
  return Promise.all(collections.map(collectionName => {
    const collection = db.collection(collectionName)
    return collection.truncate()
  }))
}

const teardownCollections = (db, collections) => {
  return Promise.all(collections.map(async name => {
    try {
      const collection = db.collection(name)
      await collection.drop()
    } catch (error) {
      if (error.message !== `unknown collection '${name}'`) {
        throw error
      }
    }
  }))
}

module.exports = { truncateCollections, teardownCollections }
