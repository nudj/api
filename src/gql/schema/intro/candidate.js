const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Intro',
  name: 'candidate',
  type: 'Person',
  collection: 'people',
  propertyName: 'candidate'
})
