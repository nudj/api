const { rootEnum } = require('../../lib')
const { NUDJ } = require('../../lib/constants')

module.exports = rootEnum({
  name: 'DataSource',
  values: [
    'LINKEDIN',
    'MANUAL',
    'SURVEY',
    NUDJ
  ]
})
