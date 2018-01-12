const { defineEntitySingularByFiltersRelation } = require('../../lib')

module.exports = defineEntitySingularByFiltersRelation({
  parentType: 'Person',
  type: 'Connection',
  parentName: 'from'
})
