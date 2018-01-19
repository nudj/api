const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'people',
  type: 'Person',
  collection: 'people'
})
