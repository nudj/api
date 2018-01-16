const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'employments',
  type: 'Employment',
  collection: 'employments'
})
