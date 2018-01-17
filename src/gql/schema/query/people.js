const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'people',
  type: 'Person',
  collection: 'people'
})
