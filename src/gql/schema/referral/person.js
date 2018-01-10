const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Referral',
  type: 'Person',
  collection: 'people'
})
