const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'connectionsByFilters',
  type: 'Connection',
  collection: 'connections',
  filterType: 'ConnectionFilterInput'
})
