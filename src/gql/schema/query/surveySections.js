const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'surveySections',
  type: 'SurveySection',
  collection: 'surveySections'
})
