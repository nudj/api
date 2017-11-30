const request = require('@nudj/library/request')
const semi = require('semi')

const store = require('./store')
const actionToCollectionLock = require('./action-to-collection-lock')
const actionToString = require('./action-to-string')

module.exports = (action, params) => {
  // semi does not accept raw functions wrapping in parentheses
  let actionString = `(${actionToString(store, action)})`
  // add semi colons
  actionString = semi.add(actionString)
  // remove newlines and multiple consecutive spaces
  actionString = actionString.replace(/\n/g, ' ').replace(/\s\s+/g, ' ')
  // strip parentheses and trailing semicolon
  actionString = actionString.slice(1, -2)

  return request('https://local.db.nudj.co/_db/nudj/_api/transaction', {
    method: 'post',
    data: {
      collections: {
        write: actionToCollectionLock(action)
      },
      action: actionString,
      params
    }
  })
  .catch(error => console.log(...error.log))
}
