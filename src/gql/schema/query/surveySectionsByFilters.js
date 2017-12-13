const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'surveySectionsByFilters',
  type: 'SurveySection',
  collection: 'surveySections',
  filterType: 'SurveySectionFilterInput'
})
