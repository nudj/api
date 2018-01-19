const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'recommendationsByFilters',
  type: 'Recommendation',
  collection: 'recommendations',
  filterType: 'RecommendationFilterInput'
})
