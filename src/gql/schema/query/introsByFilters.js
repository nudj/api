const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Query',
  name: 'introsByFilters',
  type: 'Intro',
  collection: 'intros',
  filterType: 'IntroFilterInput'
})
