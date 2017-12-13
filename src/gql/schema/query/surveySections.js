const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'surveySections',
  type: 'SurveySection',
  collection: 'surveySections'
})
