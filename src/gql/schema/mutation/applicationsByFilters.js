const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'applicationsByFilters',
  type: 'Application',
  collection: 'applications',
  filterType: 'ApplicationFilterInput'
})
