const { rootAllByFilters } = require('../../lib')

module.exports = rootAllByFilters({
  parentType: 'Mutation',
  name: 'introsByFilters',
  type: 'Intro',
  collection: 'intros',
  filterType: 'IntroFilterInput'
})
