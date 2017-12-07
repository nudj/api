const { mergeDefinitions } = require('../../lib')

module.exports = mergeDefinitions(
  require('./properties'),
  require('./user'),
  require('./people'),
  require('./companies'),
  require('./hirers'),
  require('./jobs'),
  require('./applications'),
  require('./referrals'),
  require('./connections'),
  require('./connection-sources'),
  require('./surveys'),
  require('./survey-sections'),
  require('./survey-questions'),
  require('./employees'),
  require('./roles'),
  require('./person-tasks')
)
