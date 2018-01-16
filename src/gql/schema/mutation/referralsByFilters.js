const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'referralsByFilters',
  type: 'Referral',
  collection: 'referrals',
  filterType: 'ReferralFilterInput'
})
