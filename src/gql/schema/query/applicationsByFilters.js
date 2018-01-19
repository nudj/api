const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'applicationsByFilters',
  type: 'Application',
  collection: 'applications',
  filterType: 'ApplicationFilterInput'
})
