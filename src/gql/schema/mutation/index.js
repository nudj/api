const { mergeDefinitions } = require('../../lib')

module.exports = mergeDefinitions(
  require('./properties'),
  require('./user'),
  require('./people'),
  require('./people-by-filters'),
  require('./companies'),
  require('./companies-by-filters'),
  require('./hirers'),
  require('./hirers-by-filters'),
  require('./jobs'),
  require('./jobs-by-filters'),
  require('./applications'),
  require('./applications-by-filters'),
  require('./application'),
  require('./referrals'),
  require('./referrals-by-filters'),
  require('./connections'),
  require('./connections-by-filters'),
  require('./connection-sources'),
  require('./connection-sources-by-filters'),
  require('./surveys'),
  require('./surveys-by-filters'),
  require('./survey-sections'),
  require('./survey-sections-by-filters'),
  require('./survey-questions'),
  require('./survey-questions-by-filters'),
  require('./employees'),
  require('./employees-by-filters'),
  require('./roles'),
  require('./roles-by-filters'),
  require('./person-tasks'),
  require('./person-tasks-by-filters'),
  require('./company-tasks'),
  require('./company-tasks-by-filters'),
  require('./recommendations'),
  require('./recommendations-by-filters'),
  require('./employments'),
  require('./employments-by-filters')
)
