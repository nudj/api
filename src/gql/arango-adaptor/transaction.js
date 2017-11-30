const request = require('@nudj/library/request')
const semi = require('semi')

const actionToCollectionLock = require('./action-to-collection-lock')
const actionToString = require('./action-to-string')

module.exports = (store) => (action) => {
  // semi does not accept raw functions wrapping in parentheses
  let actionString = `(${actionToString(store, action)})`
  // add semi colons
  actionString = semi.add(actionString)
  // remove newlines and multiple consecutive spaces
  actionString = actionString.replace(/\n/g, ' ').replace(/\s\s+/g, ' ')
  // strip parentheses and trailing semicolon
  actionString = actionString.slice(1, -2)

  return request('http://localhost:82/_api/transaction', {
    method: 'post',
    data: {
      collections: {
        write: actionToCollectionLock(action)
      },
      action: actionString
    }
  })
  .catch(error => console.log(...error.log))
}
