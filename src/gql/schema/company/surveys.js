const { nestedAll } = require('../../lib')

module.exports = nestedAll({
  parentType: 'Company',
  parentName: 'company',
  type: 'Survey',
  name: 'surveys',
  collection: 'surveys'
})
