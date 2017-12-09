const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  name: 'referralsByFilters',
  type: 'Referral',
  collection: 'referrals',
  filterType: 'ReferralFilterInput'
})
