const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'AccessRequest',
  type: 'Company',
  collection: 'companies'
})
