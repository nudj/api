const { defineEntitySingularByFiltersRelation } = require('../../lib')

module.exports = defineEntitySingularByFiltersRelation({
  parentType: 'Company',
  type: 'Job'
})
