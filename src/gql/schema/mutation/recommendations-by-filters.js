const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'recommendationsByFilters',
  type: 'Recommendation',
  collection: 'recommendations',
  filterType: 'RecommendationFilterInput'
})
