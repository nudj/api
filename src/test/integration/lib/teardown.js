const truncateCollections = async (db) => {
  const collections = await db.collections()
  return Promise.all(collections.map(collection => collection.truncate()))
}

const teardownCollections = async (db) => {
  const collections = await db.collections()
  return Promise.all(collections.map(async collection => {
    try {
      await collection.drop()
    } catch (error) {
      if (!error.message.startsWith('unknown collection')) {
        throw error
      }
    }
  }))
}

module.exports = { truncateCollections, teardownCollections }
