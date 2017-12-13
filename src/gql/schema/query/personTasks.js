const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Query',
  name: 'personTasks',
  type: 'PersonTask',
  collection: 'personTasks'
})
