const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'rolesByFilters',
  type: 'Role',
  collection: 'roles',
  filterType: 'RoleFilterInput'
})
