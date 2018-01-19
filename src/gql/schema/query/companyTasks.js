const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'companyTasks',
  type: 'CompanyTask',
  collection: 'companyTasks'
})
