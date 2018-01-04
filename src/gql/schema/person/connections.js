const { defineEntityPluralRelation } = require('../../lib')

module.exports = defineEntityPluralRelation({
  parentType: 'Person',
  type: 'Connection',
  parentName: 'from'
})
