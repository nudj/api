const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Referral',
  type: 'Referral',
  name: 'parent',
  propertyName: 'parent'
})
