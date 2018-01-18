const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'surveyQuestionsByFilters',
  type: 'SurveyQuestion',
  collection: 'surveyQuestions',
  filterType: 'SurveyQuestionFilterInput'
})
