const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'connections',
  type: 'Connection',
  collection: 'connections'
})
