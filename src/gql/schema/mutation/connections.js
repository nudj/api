const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'connections',
  type: 'Connection',
  collection: 'connections'
})
