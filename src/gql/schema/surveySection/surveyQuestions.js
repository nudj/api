const { defineEntityPluralRelation } = require('../../lib')

module.exports = defineEntityPluralRelation({
  parentType: 'SurveySection',
  type: 'SurveyQuestion'
})
