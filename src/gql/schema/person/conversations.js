const { defineEntityPluralRelation } = require('../../lib')

module.exports = defineEntityPluralRelation({
  parentType: 'Person',
  type: 'Conversation'
})
