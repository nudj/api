async function fetchAll (db, collection) {
  const collectionCursor = db.collection(collection)
  const allCursor = await collectionCursor.all()
  return allCursor.all()
}

module.exports = {
  fetchAll
}
