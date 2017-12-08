const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'connectionSources',
  type: 'ConnectionSource',
  collection: 'connectionSources'
})
