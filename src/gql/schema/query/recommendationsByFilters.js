const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'recommendationsByFilters',
  type: 'Recommendation',
  collection: 'recommendations',
  filterType: 'RecommendationFilterInput'
})
