const chai = require('chai')
const dirtyChai = require('dirty-chai')

const db = require('./db')
const { setupCollections, populateCollections } = require('./setup')
const { truncateCollections, teardownCollections } = require('./teardown')

const { expect } = chai

chai.use(dirtyChai)

module.exports = {
  expect,
  db,
  setupCollections,
  truncateCollections,
  teardownCollections,
  populateCollections
}
