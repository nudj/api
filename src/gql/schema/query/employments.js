const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'employments',
  type: 'Employment',
  collection: 'employments'
})
