const { defineSingularByFiltersRelation } = require('../../lib')

module.exports = defineSingularByFiltersRelation({
  parentType: 'Company',
  type: 'Job'
})
