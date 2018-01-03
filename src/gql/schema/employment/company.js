const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Employment',
  type: 'Company',
  collection: 'companies'
})
