const { rootSingleByFilters } = require('../../lib')

module.exports = rootSingleByFilters({
  parentType: 'Mutation',
  type: 'Company',
  collection: 'companies'
})
