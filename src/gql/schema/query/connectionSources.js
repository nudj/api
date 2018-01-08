const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'sources',
  type: 'Source',
  collection: 'sources'
})
