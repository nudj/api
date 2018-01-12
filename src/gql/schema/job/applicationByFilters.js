const { defineEntitySingularByFiltersRelation } = require('../../lib')

module.exports = defineEntitySingularByFiltersRelation({
  parentType: 'Job',
  type: 'Application'
})
