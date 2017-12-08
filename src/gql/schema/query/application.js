const { defineSingularRelation } = require('../../lib')

module.exports = defineSingularRelation({
  parentType: 'Query',
  name: 'application',
  type: 'Application',
  collection: 'applications'
})
