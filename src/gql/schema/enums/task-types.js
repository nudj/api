const { rootEnum } = require('../../lib')

module.exports = rootEnum({
  name: 'TaskType',
  values: [
    'HIRER_SURVEY',
    'SEND_SURVEY_INTERNAL',
    'SHARE_JOBS',
    'UNLOCK_NETWORK_LINKEDIN'
  ]
})
