const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'people',
  type: 'Person',
  collection: 'people'
})
