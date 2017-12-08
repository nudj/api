const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'surveys',
  type: 'Survey',
  collection: 'surveys'
})
