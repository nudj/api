const { nestedCountByFilters } = require('../../lib')

module.exports = nestedCountByFilters({
  parentType: 'Job',
  type: 'Referral'
})
