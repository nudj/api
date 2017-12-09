const { defineSingularRelation } = require('../../lib')

module.exports = defineSingularRelation({
  parentType: 'Query',
  type: 'Person',
  collection: 'people'
})
