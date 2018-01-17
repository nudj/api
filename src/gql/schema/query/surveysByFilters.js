const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'surveysByFilters',
  type: 'Survey',
  collection: 'surveys',
  filterType: 'SurveyFilterInput'
})
