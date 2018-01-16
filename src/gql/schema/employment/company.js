const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Employment',
  type: 'Company',
  collection: 'companies'
})
