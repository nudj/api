const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'peopleByFilters',
  type: 'Person',
  collection: 'people',
  filterType: 'PersonFilterInput'
})
