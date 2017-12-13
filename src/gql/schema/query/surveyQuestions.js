const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'surveyQuestions',
  type: 'SurveyQuestion',
  collection: 'surveyQuestions'
})
