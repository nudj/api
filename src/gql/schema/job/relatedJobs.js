const { defineEntityPluralRelation } = require('../../lib')

module.exports = defineEntityPluralRelation({
  parentType: 'Job',
  type: 'Job',
  name: 'relatedJobs',
  parentPropertyName: 'relatedJobs'
})
