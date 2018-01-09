const { defineEntityPluralByFiltersRelation } = require('../../lib')

module.exports = defineEntityPluralByFiltersRelation({
  parentType: 'Company',
  type: 'Survey'
})
