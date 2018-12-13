const { nestedAllByFilters } = require('../../lib')

module.exports = nestedAllByFilters({
  parentType: 'Company',
  type: 'Survey',
  name: 'surveysByFilters',
  collection: 'surveys',
  parentName: 'company',
  filterType: 'SurveyFilterInput'
})
