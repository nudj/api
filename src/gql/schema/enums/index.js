const { mergeDefinitions } = require('../../lib')

module.exports = mergeDefinitions(
  require('./survey-question-types'),
  require('./recommendation-sources')
)
