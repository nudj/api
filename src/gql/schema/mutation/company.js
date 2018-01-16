const { rootSingle } = require('../../lib')

module.exports = rootSingle({
  parentType: 'Mutation',
  type: 'Company',
  collection: 'companies'
})
