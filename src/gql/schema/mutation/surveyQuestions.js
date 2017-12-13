const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'surveyQuestions',
  type: 'SurveyQuestion',
  collection: 'surveyQuestions'
})
