const { defineSingularRelation } = require('../../lib')

module.exports = defineSingularRelation({
  parentType: 'Query',
  type: 'Company',
  collection: 'companies'
})
