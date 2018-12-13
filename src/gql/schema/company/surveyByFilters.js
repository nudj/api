const { nestedSingleByFilters } = require('../../lib')

module.exports = nestedSingleByFilters({
  parentType: 'Company',
  type: 'Survey',
  name: 'surveyByFilters',
  collection: 'surveys',
  parentName: 'company',
  filterType: 'SurveyFilterInput'
})
