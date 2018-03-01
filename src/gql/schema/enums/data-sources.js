const { rootEnum } = require('../../lib')

module.exports = rootEnum({
  name: 'DataSource',
  values: [
    'LINKEDIN',
    'MANUAL',
    'SURVEY'
  ]
})
