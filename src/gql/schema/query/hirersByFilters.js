const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'hirersByFilters',
  type: 'Hirer',
  collection: 'hirers',
  filterType: 'HirerFilterInput'
})
