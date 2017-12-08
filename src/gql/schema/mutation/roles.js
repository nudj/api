const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'roles',
  type: 'Role',
  collection: 'roles'
})
