const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'SurveyAnswer',
  type: 'Person',
  collection: 'people'
})
