const { nestedSingleForeign } = require('../../lib')

module.exports = nestedSingleForeign({
  parentType: 'Person',
  type: 'Hirer'
})
