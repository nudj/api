const { nestedAll } = require('../../lib')

module.exports = nestedAll({
  parentType: 'Company',
  type: 'CompanyTask',
  name: 'tasks'
})
