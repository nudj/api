const { mergeDefinitions } = require('../../lib')

module.exports = mergeDefinitions(
  require('./properties'),
  require('./filter-properties')
)
