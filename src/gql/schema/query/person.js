const { rootSingle } = require('../../lib')

module.exports = rootSingle({
  parentType: 'Query',
  type: 'Person',
  collection: 'people'
})
