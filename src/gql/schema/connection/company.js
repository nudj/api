const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Connection',
  type: 'Company',
  collection: 'companies'
})
