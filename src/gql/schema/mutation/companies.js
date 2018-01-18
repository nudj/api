const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'companies',
  type: 'Company',
  collection: 'companies'
})
