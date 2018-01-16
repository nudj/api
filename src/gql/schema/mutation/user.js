const { rootSingle } = require('../../lib')

module.exports = rootSingle({
  parentType: 'Mutation',
  name: 'user',
  type: 'Person',
  collection: 'people'
})
