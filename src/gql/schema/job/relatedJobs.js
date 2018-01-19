const { nestedAll } = require('../../lib')

module.exports = nestedAll({
  parentType: 'Job',
  type: 'Job',
  name: 'relatedJobs',
  parentPropertyName: 'relatedJobs'
})
