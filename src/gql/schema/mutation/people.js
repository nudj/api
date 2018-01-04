const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'people',
  type: 'Person',
  collection: 'people'
})
