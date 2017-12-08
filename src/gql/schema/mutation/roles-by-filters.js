const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'rolesByFilters',
  type: 'Role',
  collection: 'roles',
  filterType: 'RoleFilterInput'
})
