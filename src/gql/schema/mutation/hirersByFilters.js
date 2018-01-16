const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'hirersByFilters',
  type: 'Hirer',
  collection: 'hirers',
  filterType: 'HirerFilterInput'
})
