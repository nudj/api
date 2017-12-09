const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'surveysByFilters',
  type: 'Survey',
  collection: 'surveys',
  filterType: 'SurveyFilterInput'
})
