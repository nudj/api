const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'applications',
  type: 'Application',
  collection: 'applications'
})
