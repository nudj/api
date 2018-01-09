const { defineEnum } = require('../../lib')

module.exports = defineEnum({
  name: 'EmailPreference',
  values: ['GOOGLE', 'OTHER']
})
