const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'referralsByFilters',
  type: 'Referral',
  collection: 'referrals',
  filterType: 'ReferralFilterInput'
})
