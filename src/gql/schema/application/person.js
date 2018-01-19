const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Application',
  type: 'Person',
  collection: 'people'
})
