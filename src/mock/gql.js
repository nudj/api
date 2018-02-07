const rest = require('./rest')
const gql = require('../gql')
const { transaction, store } = require('../gql/adaptors/json-server')

const getMockApiApps = ({ data, addCustomHandlers }) => ({
  jsonServer: rest({ data, addCustomHandlers }),
  gqlServer: gql({ transaction, store })
})

module.exports = getMockApiApps
