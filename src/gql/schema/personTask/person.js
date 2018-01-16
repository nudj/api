const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'PersonTask',
  type: 'Person',
  collection: 'people'
})
