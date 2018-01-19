const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Hirer',
  type: 'Company',
  collection: 'companies'
})
