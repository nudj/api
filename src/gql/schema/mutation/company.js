const { defineSingularRelation } = require('../../lib')

module.exports = defineSingularRelation({
  parentType: 'Mutation',
  type: 'Company',
  collection: 'companies'
})