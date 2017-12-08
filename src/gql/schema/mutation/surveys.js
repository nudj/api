const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'surveys',
  type: 'Survey',
  collection: 'surveys'
})
