const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'companies',
  type: 'Company',
  collection: 'companies'
})
