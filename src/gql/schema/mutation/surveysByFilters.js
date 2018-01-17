const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'surveysByFilters',
  type: 'Survey',
  collection: 'surveys',
  filterType: 'SurveyFilterInput'
})
