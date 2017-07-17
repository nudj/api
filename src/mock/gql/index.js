const gql = require('../../gql')
const rest = require('../rest')
const storeAdaptor = require('./gql/store')

module.exports = ({data}) => {
  return {
    listen (gqlPort, restPort, cb) {
      rest({data}).listen(restPort, () => gql({storeAdaptor}).listen(gqlPort, cb))
    }
  }
}
