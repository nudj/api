const { defineSingularRelation } = require('../../lib')

module.exports = defineSingularRelation({
  parentType: 'Query',
  name: 'user',
  type: 'Person',
  collection: 'people'
})
