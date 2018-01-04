const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'connections',
  type: 'Connection',
  collection: 'connections'
})
