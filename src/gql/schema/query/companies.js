const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'companies',
  type: 'Company',
  collection: 'companies'
})
