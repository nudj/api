const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'personTasksByFilters',
  type: 'PersonTask',
  collection: 'personTasks',
  filterType: 'PersonTaskFilterInput'
})
