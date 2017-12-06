const { definitionMerger } = require('../../lib')

module.exports = definitionMerger(
  require('./properties'),
  require('./hirers')
)
