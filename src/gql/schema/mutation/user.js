const { defineSingularRelation } = require('../../lib')

module.exports = defineSingularRelation({
  parentType: 'Mutation',
  name: 'user',
  type: 'Person',
  collection: 'people'
})
