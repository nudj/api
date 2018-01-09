const rest = require('../rest')
const gql = require('../../gql')
const transaction = require('../../gql/adaptors/json-server')

const getMockApiApps = ({ data, addCustomHandlers }) => ({
  jsonServer: rest({ data, addCustomHandlers }),
  gqlServer: gql({ transaction })
})

module.exports = getMockApiApps
