const { definitionMerger } = require('../../lib')

module.exports = definitionMerger(
  require('./properties'),
  require('./user'),
  require('./people'),
  require('./companies'),
  require('./hirers'),
  require('./jobs'),
  require('./applications'),
  require('./referrals'),
  require('./connections'),
  require('./connection-sources')
)
