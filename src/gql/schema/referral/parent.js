const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Referral',
  type: 'Referral',
  name: 'parent'
})
