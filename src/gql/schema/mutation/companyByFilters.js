const { defineSingularByFiltersRelation } = require('../../lib')

module.exports = defineSingularByFiltersRelation({
  parentType: 'Mutation',
  type: 'Company',
  collection: 'companies'
})