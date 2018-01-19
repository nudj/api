const { nestedSingleByFilters } = require('../../lib')

module.exports = nestedSingleByFilters({
  parentType: 'SurveySection',
  type: 'SurveyQuestion'
})
