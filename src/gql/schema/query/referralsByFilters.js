const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  name: 'referralsByFilters',
  type: 'Referral',
  collection: 'referrals',
  filterType: 'ReferralFilterInput'
})
