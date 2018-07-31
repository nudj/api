const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'AccessRequest',
  type: 'Person',
  collection: 'people'
})
