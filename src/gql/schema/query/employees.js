const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'employees',
  type: 'Employee',
  collection: 'employees'
})
