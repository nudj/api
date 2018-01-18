const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'personTasksByFilters',
  type: 'PersonTask',
  collection: 'personTasks',
  filterType: 'PersonTaskFilterInput'
})
