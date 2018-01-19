const { nestedAll } = require('../../lib')

module.exports = nestedAll({
  parentType: 'Person',
  type: 'Connection',
  parentName: 'from'
})
