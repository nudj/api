const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'CompanyTask',
  type: 'Person',
  collection: 'people',
  name: 'completedBy'
})
