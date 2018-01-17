const { nestedSingleByFilters } = require('../../lib')

module.exports = nestedSingleByFilters({
  parentType: 'Person',
  type: 'Conversation'
})
