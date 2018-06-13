async function fetchAll (db, collection, filters) {
  const collectionCursor = db.collection(collection)

  let dataCursor
  if (filters) {
    dataCursor = await collectionCursor.byExample(filters)
  } else {
    dataCursor = await collectionCursor.all()
  }

  return dataCursor.all()
}

module.exports = {
  fetchAll
}
