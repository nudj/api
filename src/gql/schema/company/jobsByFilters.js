const { nestedAllByFilters } = require('../../lib')

module.exports = nestedAllByFilters({
  parentType: 'Company',
  type: 'Job'
})
