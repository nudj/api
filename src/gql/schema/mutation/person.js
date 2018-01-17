const { rootSingle } = require('../../lib')

module.exports = rootSingle({
  parentType: 'Mutation',
  type: 'Person',
  collection: 'people'
})
