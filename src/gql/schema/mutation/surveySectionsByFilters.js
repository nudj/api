const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'surveySectionsByFilters',
  type: 'SurveySection',
  collection: 'surveySections',
  filterType: 'SurveySectionFilterInput'
})
