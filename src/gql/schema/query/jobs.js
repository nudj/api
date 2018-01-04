const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'jobs',
  type: 'Job',
  collection: 'jobs'
})
