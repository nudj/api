const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'PersonTask',
  type: 'Person',
  collection: 'people',
  name: 'completedBy'
})
