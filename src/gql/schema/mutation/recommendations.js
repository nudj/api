const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'recommendations',
  type: 'Recommendation',
  collection: 'recommendations'
})
