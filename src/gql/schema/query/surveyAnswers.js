const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'surveyAnswers',
  type: 'SurveyAnswer',
  collection: 'surveyAnswers'
})
