const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Query',
  type: 'SurveyAnswer'
})
