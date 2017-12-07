const { defineEnum } = require('../../lib')

module.exports = defineEnum({
  name: 'SurveyQuestionType',
  values: [
    'COMPANIES',
    'CONNECTIONS'
  ]
})
