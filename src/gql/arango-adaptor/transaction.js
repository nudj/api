const request = require('@nudj/library/request')
const actionToCollectionLock = require('./action-to-collection-lock')
const actionToString = require('./action-to-string')

module.exports = (store) => (action) => {
  return request('http://localhost:82/_api/transaction', {
    method: 'post',
    data: {
      collections: {
        write: actionToCollectionLock(action)
      },
      action: actionToString(store, action)
    }
  })
  .catch(error => console.log(...error.log))
}
