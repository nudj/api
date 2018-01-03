const { defineEntitySingularRelation } = require('../../lib')

module.exports = defineEntitySingularRelation({
  parentType: 'Connection',
  type: 'ConnectionSource',
  name: 'source'
})
