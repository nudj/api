const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Conversation',
  type: 'Person',
  name: 'recipient',
  collection: 'people'
})
