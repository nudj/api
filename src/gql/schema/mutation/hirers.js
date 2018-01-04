const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'hirers',
  type: 'Hirer',
  collection: 'hirers'
})
