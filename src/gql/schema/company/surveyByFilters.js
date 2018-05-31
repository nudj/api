const { nestedSingleByFiltersViaEdge } = require('../../lib')

module.exports = nestedSingleByFiltersViaEdge({
  fromType: 'Company',
  toType: 'Survey',
  name: 'surveyByFilters',
  edgeCollection: 'companySurveys',
  toCollection: 'surveys',
  fromEdgePropertyName: 'company',
  toEdgePropertyName: 'survey',
  filterType: 'SurveyFilterInput'
})
