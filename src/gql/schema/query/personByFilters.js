const { rootSingleByFilters } = require('../../lib')

module.exports = rootSingleByFilters({
  parentType: 'Query',
  type: 'Person',
  collection: 'people'
})
