const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'applications',
  type: 'Application',
  collection: 'applications'
})
