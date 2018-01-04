const PromiseOverride = require('./promise-override')

module.exports = (store, action) => {
  if (!store) {
    throw new Error('No store supplied')
  }
  if (!action) {
    throw new Error('No action supplied')
  }
  return `function (params) {
    const Promise = (${PromiseOverride.toString()})()
    const store = ${store.toString()}
    const action = ${action.toString()}
    const result = action(store(), params)
    if (result.error) { throw error }
    return result.resolution
  }`
}
