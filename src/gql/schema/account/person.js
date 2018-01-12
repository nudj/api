const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Account',
  type: 'Person',
  collection: 'people'
})
