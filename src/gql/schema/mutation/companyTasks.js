const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'companyTasks',
  type: 'CompanyTask',
  collection: 'companyTasks'
})
