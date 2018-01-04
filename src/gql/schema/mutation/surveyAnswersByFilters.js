const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'surveyAnswersByFilters',
  type: 'SurveyAnswer',
  collection: 'surveyAnswers',
  filterType: 'SurveyAnswerFilterInput'
})
