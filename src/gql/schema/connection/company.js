const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Connection',
  type: 'Company',
  collection: 'companies'
})
