const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'surveyQuestionsByFilters',
  type: 'SurveyQuestion',
  collection: 'surveyQuestions',
  filterType: 'SurveyQuestionFilterInput'
})
