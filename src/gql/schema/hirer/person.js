const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Hirer',
  type: 'Person',
  collection: 'people'
})
