const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'sources',
  type: 'Source',
  collection: 'sources'
})
