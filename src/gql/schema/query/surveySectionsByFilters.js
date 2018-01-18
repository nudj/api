const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'surveySectionsByFilters',
  type: 'SurveySection',
  collection: 'surveySections',
  filterType: 'SurveySectionFilterInput'
})
