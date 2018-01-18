const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'roles',
  type: 'Role',
  collection: 'roles'
})
