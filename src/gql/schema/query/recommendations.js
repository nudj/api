const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'recommendations',
  type: 'Recommendation',
  collection: 'recommendations'
})
