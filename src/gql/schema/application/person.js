const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Application',
  type: 'Person',
  collection: 'people'
})