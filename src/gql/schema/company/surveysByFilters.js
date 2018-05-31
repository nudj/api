const { nestedAllByFiltersViaEdge } = require('../../lib')

module.exports = nestedAllByFiltersViaEdge({
  fromType: 'Company',
  toType: 'Survey',
  name: 'surveysByFilters',
  edgeCollection: 'companySurveys',
  toCollection: 'surveys',
  fromEdgePropertyName: 'company',
  toEdgePropertyName: 'survey',
  filterType: 'SurveyFilterInput'
})
