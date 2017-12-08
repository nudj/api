const { defineSingularRelation } = require('../../lib')

module.exports = defineSingularRelation({
  parentType: 'Mutation',
  name: 'application',
  type: 'Application',
  collection: 'applications'
})
