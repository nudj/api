const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'companies',
  type: 'Company',
  collection: 'companies'
})
