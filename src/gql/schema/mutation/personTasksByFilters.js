const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'personTasksByFilters',
  type: 'PersonTask',
  collection: 'personTasks',
  filterType: 'PersonTaskFilterInput'
})
