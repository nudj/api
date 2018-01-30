const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Connection',
  type: 'Person',
  collection: 'people',
  name: 'from',
  propertyName: 'from'
})
