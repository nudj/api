const { defineSingularByFiltersRelation } = require('../../lib')

module.exports = defineSingularByFiltersRelation({
  parentType: 'Mutation',
  type: 'Person',
  collection: 'people'
})
