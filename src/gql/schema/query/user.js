const { rootSingle } = require('../../lib')

module.exports = rootSingle({
  parentType: 'Query',
  name: 'user',
  type: 'Person',
  collection: 'people'
})
