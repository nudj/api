const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'hirers',
  type: 'Hirer',
  collection: 'hirers'
})
