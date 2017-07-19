const gql = require('../../gql')
const rest = require('../rest')
const storeAdaptor = require('./store')

module.exports = ({ data, addCustomHandlers }) => {
  return {
    listen (gqlPort, restPort, cb) {
      rest({ data, addCustomHandlers }).listen(restPort, () => gql({storeAdaptor}).listen(gqlPort, cb))
    }
  }
}
