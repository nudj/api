const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Account',
  type: 'Person',
  collection: 'people'
})
