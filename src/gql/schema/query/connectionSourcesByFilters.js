const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'sourcesByFilters',
  type: 'Source',
  collection: 'sources',
  filterType: 'SourceFilterInput'
})
