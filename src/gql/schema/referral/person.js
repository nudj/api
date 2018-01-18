const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Referral',
  type: 'Person',
  collection: 'people'
})
