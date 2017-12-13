const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'surveyQuestionsByFilters',
  type: 'SurveyQuestion',
  collection: 'surveyQuestions',
  filterType: 'SurveyQuestionFilterInput'
})
