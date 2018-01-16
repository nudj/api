const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'personTasks',
  type: 'PersonTask',
  collection: 'personTasks'
})
