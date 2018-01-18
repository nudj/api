const { nestedSingleByFilters } = require('../../lib')

module.exports = nestedSingleByFilters({
  parentType: 'Job',
  type: 'Application'
})
