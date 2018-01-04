const { defineSingularByFiltersRelation } = require('../../lib')

module.exports = defineSingularByFiltersRelation({
  parentType: 'Query',
  type: 'Role'
})
