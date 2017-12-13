const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'surveySections',
  type: 'SurveySection',
  collection: 'surveySections'
})
