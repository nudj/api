const { nestedAll } = require('../../lib')

module.exports = nestedAll({
  parentType: 'Person',
  type: 'PersonTask',
  name: 'tasks'
})
