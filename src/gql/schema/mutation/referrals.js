const { definePluralRelation } = require('../../lib')

module.exports = definePluralRelation({
  parentType: 'Mutation',
  name: 'referrals',
  type: 'Referral',
  collection: 'referrals'
})
