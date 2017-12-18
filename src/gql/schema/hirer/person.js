const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Hirer',
  type: 'Person',
  collection: 'people'
})
