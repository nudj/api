const { defineSingularByFiltersRelation } = require('../../lib')

module.exports = defineSingularByFiltersRelation({
  parentType: 'Query',
  type: 'Company',
  collection: 'companies'
})
