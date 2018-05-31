const { nestedAllViaEdge } = require('../../lib')

module.exports = nestedAllViaEdge({
  fromType: 'Company',
  toType: 'Survey',
  name: 'surveys',
  edgeCollection: 'companySurveys',
  toCollection: 'surveys',
  fromEdgePropertyName: 'company',
  toEdgePropertyName: 'survey'
})
