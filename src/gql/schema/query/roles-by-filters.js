const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'rolesByFilters',
  type: 'Role',
  collection: 'roles',
  filterType: 'RoleFilterInput'
})
