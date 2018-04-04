const PromiseOverride = require('./promise-override')
const loadArangoCryptoAdaptor = require('./crypto-adaptor')
const { idTypes } = require('@nudj/library/lib/constants')

const generateId = require('@nudj/library/lib/hash/generate-id')

module.exports = (store, action) => {
  if (!store) {
    throw new Error('No store supplied')
  }
  if (!action) {
    throw new Error('No action supplied')
  }
  return `function (params) {
    const Promise = (${PromiseOverride.toString()})()
    const idTypes = ${JSON.stringify(idTypes)}
    const loadArangoCryptoAdaptor = ${loadArangoCryptoAdaptor.toString()}
    const loadIdGenerator = ${generateId.toString()}
    const store = ${store.toString()}
    const action = ${action.toString()}
    const result = action(store(), params)
    if (result.error) { throw result.error }
    return result.resolution
  }`
}
