const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'sourcesByFilters',
  type: 'Source',
  collection: 'sources',
  filterType: 'SourceFilterInput'
})
