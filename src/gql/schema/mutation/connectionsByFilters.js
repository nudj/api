const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'connectionsByFilters',
  type: 'Connection',
  collection: 'connections',
  filterType: 'ConnectionFilterInput'
})
