const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'hirers',
  type: 'Hirer',
  collection: 'hirers'
})
