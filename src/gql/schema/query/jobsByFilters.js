const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'jobsByFilters',
  type: 'Job',
  collection: 'jobs',
  filterType: 'JobFilterInput'
})
