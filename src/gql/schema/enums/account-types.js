const { defineEnum } = require('../../lib')

module.exports = defineEnum({
  name: 'AccountType',
  values: [
    'GOOGLE',
    'OTHER'
  ]
})
