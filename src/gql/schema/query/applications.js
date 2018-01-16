const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'applications',
  type: 'Application',
  collection: 'applications'
})
