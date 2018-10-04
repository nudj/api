const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Intro',
  name: 'job',
  type: 'Job',
  collection: 'jobs',
  propertyName: 'job'
})
