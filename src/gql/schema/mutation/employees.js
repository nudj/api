const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'employees',
  type: 'Employee',
  collection: 'employees'
})
