const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'jobs',
  type: 'Job',
  collection: 'jobs'
})
