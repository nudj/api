const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'applications',
  type: 'Application',
  collection: 'applications'
})
