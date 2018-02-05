const { nestedAllByFilters } = require('../../lib')

module.exports = nestedAllByFilters({
  parentType: 'Job',
  type: 'Application'
})
