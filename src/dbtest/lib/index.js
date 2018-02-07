const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)
const { expect } = chai

module.exports = {
  expect,
  db: require('./db'),
  collections: require('./collections'),
  setupDatabase: require('./setup-database'),
  truncateDatabase: require('./truncate-database'),
  populateDbCollection: require('./populate-db-collection')
}
