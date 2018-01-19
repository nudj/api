const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'surveys',
  type: 'Survey',
  collection: 'surveys'
})
