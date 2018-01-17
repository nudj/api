const { rootEnum } = require('../../lib')

module.exports = rootEnum({
  name: 'JobStatus',
  values: [
    'PUBLISHED',
    'ARCHIVED'
  ]
})
