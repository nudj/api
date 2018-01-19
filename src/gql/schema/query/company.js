const { rootSingle } = require('../../lib')

module.exports = rootSingle({
  parentType: 'Query',
  type: 'Company',
  collection: 'companies'
})
