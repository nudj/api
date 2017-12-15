const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Job',
  type: 'Company',
  collection: 'companies'
})
