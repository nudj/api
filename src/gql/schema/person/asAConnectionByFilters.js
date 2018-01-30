const { nestedSingleByFilters } = require('../../lib')

module.exports = nestedSingleByFilters({
  parentType: 'Person',
  type: 'Connection',
  parentName: 'person',
  name: 'asAConnectionByFilters'
})
