const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'surveyQuestions',
  type: 'SurveyQuestion',
  collection: 'surveyQuestions'
})
