const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'recommendationsByFilters',
  type: 'Recommendation',
  collection: 'recommendations',
  filterType: 'RecommendationFilterInput'
})
