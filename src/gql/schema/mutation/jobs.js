const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'jobs',
  type: 'Job',
  collection: 'jobs'
})
