const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'surveySections',
  type: 'SurveySection',
  collection: 'surveySections'
})
