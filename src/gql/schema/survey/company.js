const { nestedSingleViaEdge } = require('../../lib')

module.exports = nestedSingleViaEdge({
  fromType: 'Survey',
  toType: 'Company',
  name: 'company',
  edgeCollection: 'companySurveys',
  toCollection: 'companies',
  fromEdgePropertyName: 'survey',
  toEdgePropertyName: 'company'
})
