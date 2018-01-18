const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Job',
  type: 'Company',
  collection: 'companies'
})
