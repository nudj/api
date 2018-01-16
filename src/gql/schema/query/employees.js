const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'employees',
  type: 'Employee',
  collection: 'employees'
})
