const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'personTasks',
  type: 'PersonTask',
  collection: 'personTasks'
})
