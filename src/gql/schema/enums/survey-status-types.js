const { rootEnum } = require('../../lib')

module.exports = rootEnum({
  name: 'SurveyStatus',
  values: [
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
  ]
})
