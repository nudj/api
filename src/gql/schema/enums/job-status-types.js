const { rootEnum } = require('../../lib')

module.exports = rootEnum({
  name: 'JobStatus',
  values: [
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
  ]
})
