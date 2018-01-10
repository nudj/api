const { defineEnum } = require('../../lib')

module.exports = defineEnum({
  name: 'JobStatus',
  values: [
    'PUBLISHED',
    'ARCHIVED'
  ]
})
