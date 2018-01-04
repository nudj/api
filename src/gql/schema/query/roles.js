const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'roles',
  type: 'Role',
  collection: 'roles'
})
