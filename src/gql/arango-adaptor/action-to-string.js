const map = require('lodash/map')

module.exports = (store, action) => {
  if (!store) {
    throw new Error('No store supplied')
  }
  if (!action) {
    throw new Error('No action supplied')
  }
  return `function (params) {
    const store = { ${map(store, (value, key) => `${key}: ${value.toString()}`).join(', ')} }
    const action = ${action.toString()}
    return action(store)
  }`
}
