const gql = require('../../gql')
const rest = require('../rest')
const transaction = require('./json-server-adaptor')

module.exports = ({ data, addCustomHandlers }) => {
  return {
    listen (restPort, gqlPort, cb) {
      rest({ data, addCustomHandlers }).listen(restPort, () => {
        return gql({ transaction }).listen(gqlPort, cb)
      })
    }
  }
}
