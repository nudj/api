const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'connectionSources',
  type: 'ConnectionSource',
  collection: 'connectionSources'
})
