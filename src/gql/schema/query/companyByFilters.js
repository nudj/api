const { rootSingleByFilters } = require('../../lib')

module.exports = rootSingleByFilters({
  parentType: 'Query',
  type: 'Company',
  collection: 'companies'
})
