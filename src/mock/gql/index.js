const gql = require('../../gql')
const rest = require('../rest')
const storeAdaptor = require('./store')

module.exports = ({ data, addCustomHandlers, baseURL }) => {
  return {
    listen (restPort, gqlPort, cb) {
      baseURL = baseURL || `http://localhost:${restPort}/`
      rest({ data, addCustomHandlers }).listen(restPort, () => {
        return gql({
          storeAdaptor: storeAdaptor({ baseURL })
        }).listen(gqlPort, cb)
      })
    }
  }
}
