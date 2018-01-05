const { definePluralByFiltersRelation } = require('../../lib')

module.exports = definePluralByFiltersRelation({
  parentType: 'Mutation',
  type: 'SurveyAnswer'
})
