const { defineEntitySingularByFiltersRelation } = require('../../lib')

module.exports = defineEntitySingularByFiltersRelation({
  parentType: 'SurveySection',
  type: 'SurveyQuestion'
})
