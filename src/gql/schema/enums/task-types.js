const { defineEnum } = require('../../lib')

module.exports = defineEnum({
  name: 'TaskType',
  values: [
    'HIRER_SURVEY',
    'SEND_SURVEY_INTERNAL',
    'SHARE_JOBS',
    'UNLOCK_NETWORK_LINKEDIN'
  ]
})
