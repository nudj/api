const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'jobs',
  type: 'Job',
  collection: 'jobs'
})
