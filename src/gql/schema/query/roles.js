const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'roles',
  type: 'Role',
  collection: 'roles'
})
