const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Intro',
  name: 'person',
  type: 'Person',
  collection: 'people',
  propertyName: 'person'
})
