const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'referrals',
  type: 'Referral',
  collection: 'referrals'
})
