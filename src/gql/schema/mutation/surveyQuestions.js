const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'surveyQuestions',
  type: 'SurveyQuestion',
  collection: 'surveyQuestions'
})
