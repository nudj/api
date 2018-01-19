const { nestedSingle } = require('../../lib')

module.exports = nestedSingle({
  parentType: 'Survey',
  type: 'Company',
  collection: 'companies'
})
