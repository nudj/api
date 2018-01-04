const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'surveyAnswers',
  type: 'SurveyAnswer',
  collection: 'surveyAnswers'
})
