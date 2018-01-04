const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'SurveyAnswer',
  type: 'SurveyQuestion',
  collection: 'surveyQuestions'
})
