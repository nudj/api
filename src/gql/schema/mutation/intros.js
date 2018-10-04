const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Mutation',
  name: 'intros',
  type: 'Intro',
  collection: 'intros'
})
