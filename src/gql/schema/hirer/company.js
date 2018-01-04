const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Hirer',
  type: 'Company',
  collection: 'companies'
})
