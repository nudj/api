const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'surveySectionsByFilters',
  type: 'SurveySection',
  collection: 'surveySections',
  filterType: 'SurveySectionFilterInput'
})
