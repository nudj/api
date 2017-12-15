const { defineEntityPluralRelation } = require('../../lib')

module.exports = defineEntityPluralRelation({
  parentType: 'Company',
  type: 'CompanyTask',
  name: 'tasks'
})
