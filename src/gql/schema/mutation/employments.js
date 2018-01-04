const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'employments',
  type: 'Employment',
  collection: 'employments'
})
