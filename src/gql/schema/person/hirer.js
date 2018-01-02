const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Person',
  type: 'Hirer'
})
