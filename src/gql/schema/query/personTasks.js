const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'personTasks',
  type: 'PersonTask',
  collection: 'personTasks'
})
