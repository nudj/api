const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'surveyAnswersByFilters',
  type: 'SurveyAnswer',
  collection: 'surveyAnswers',
  filterType: 'SurveyAnswerFilterInput'
})
