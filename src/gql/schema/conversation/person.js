const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Conversation',
  type: 'Person',
  collection: 'people'
})
