const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'sources',
  type: 'Source',
  collection: 'sources'
})
