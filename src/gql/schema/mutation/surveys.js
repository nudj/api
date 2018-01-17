const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'surveys',
  type: 'Survey',
  collection: 'surveys'
})
