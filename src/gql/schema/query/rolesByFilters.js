const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'rolesByFilters',
  type: 'Role',
  collection: 'roles',
  filterType: 'RoleFilterInput'
})
