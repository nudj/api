const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'employments',
  type: 'Employment',
  collection: 'employments'
})
