const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'employees',
  type: 'Employee',
  collection: 'employees'
})
