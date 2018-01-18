const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'jobsByFilters',
  type: 'Job',
  collection: 'jobs',
  filterType: 'JobFilterInput'
})
