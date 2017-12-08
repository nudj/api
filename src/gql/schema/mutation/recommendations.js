const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'recommendations',
  type: 'Recommendation',
  collection: 'recommendations'
})
