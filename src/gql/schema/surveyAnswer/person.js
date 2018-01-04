const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'SurveyAnswer',
  type: 'Person',
  collection: 'people'
})
