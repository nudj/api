const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Survey',
  type: 'SurveySection',
  name: 'section'
})
