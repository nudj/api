const { nestedAll } = require('../../lib')

module.exports = nestedAll({
  parentType: 'Referral',
  parentName: 'parent',
  name: 'children',
  type: 'Referral',
  collection: 'referrals'
})
