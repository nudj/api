const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'connections',
  type: 'Connection',
  collection: 'connections'
})
