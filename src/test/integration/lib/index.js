const chai = require('chai')
const dirtyChai = require('dirty-chai')
const chaiAsPromised = require('chai-as-promised')

const { db, noSQL } = require('./db')
const { setupCollections, populateCollections } = require('./setup')
const { truncateCollections, teardownCollections } = require('./teardown')

const { expect } = chai

chai.use(dirtyChai)
chai.use(chaiAsPromised)

module.exports = {
  expect,
  db,
  noSQL,
  setupCollections,
  truncateCollections,
  teardownCollections,
  populateCollections
}
