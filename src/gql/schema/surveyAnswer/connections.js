const { defineEntityPluralRelation } = require('../../lib')

module.exports = defineEntityPluralRelation({
  parentType: 'SurveyAnswer',
  type: 'Connection'
})
