const { rootAll } = require('../../lib')

module.exports = rootAll({
  parentType: 'Query',
  name: 'intros',
  type: 'Intro',
  collection: 'intros'
})
