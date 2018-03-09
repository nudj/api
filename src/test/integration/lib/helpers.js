module.exports = {
  getFirstItemFromCollection: async (collectionName, db) => {
    const collection = await db.collection(collectionName)
    const cursorAll = await collection.all()
    const all = await cursorAll.all()
    return all[0]
  }
}
