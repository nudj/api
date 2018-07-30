const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'AccessRequest',
  type: 'Hirer',
  collection: 'hirers',
  name: 'acceptedBy',
  propertyName: 'acceptedBy'
})
