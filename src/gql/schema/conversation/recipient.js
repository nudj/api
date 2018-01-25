const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Conversation',
  type: 'Person',
  collection: 'people',
  name: 'recipient',
  propertyName: 'recipient'
})
