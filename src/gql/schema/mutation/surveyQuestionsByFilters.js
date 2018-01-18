const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'surveyQuestionsByFilters',
  type: 'SurveyQuestion',
  collection: 'surveyQuestions',
  filterType: 'SurveyQuestionFilterInput'
})
