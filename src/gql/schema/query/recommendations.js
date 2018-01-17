const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'recommendations',
  type: 'Recommendation',
  collection: 'recommendations'
})
