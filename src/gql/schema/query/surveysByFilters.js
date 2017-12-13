const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'surveysByFilters',
  type: 'Survey',
  collection: 'surveys',
  filterType: 'SurveyFilterInput'
})
