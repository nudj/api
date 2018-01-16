const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'sources',
  type: 'Source',
  collection: 'sources'
})
