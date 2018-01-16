const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'referrals',
  type: 'Referral',
  collection: 'referrals'
})
