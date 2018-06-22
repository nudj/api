const { nestedAllViaEdge } = require('../../lib')

module.exports = nestedAllViaEdge({
  fromType: 'Job',
  toType: 'Job',
  name: 'relatedJobs',
  edgeCollection: 'relatedJobs',
  toCollection: 'jobs',
  fromEdgePropertyName: 'from',
  toEdgePropertyName: 'to'
})
