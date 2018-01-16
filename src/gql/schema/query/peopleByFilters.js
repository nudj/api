const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'peopleByFilters',
  type: 'Person',
  collection: 'people',
  filterType: 'PersonFilterInput'
})
