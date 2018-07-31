const { nestedSingleViaEdge } = require('../../lib')

module.exports = nestedSingleViaEdge({
  fromType: 'AccessRequest',
  toType: 'Hirer',
  name: 'acceptedBy',
  edgeCollection: 'acceptedAccessRequests',
  toCollection: 'hirers',
  fromEdgePropertyName: 'accessRequest',
  toEdgePropertyName: 'hirer'
})
