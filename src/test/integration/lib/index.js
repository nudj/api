const chai = require('chai')
const dirtyChai = require('dirty-chai')

const db = require('./db')
const sql = require('./sql')
const { setupCollections, populateCollections } = require('./setup')
const { truncateCollections, teardownCollections } = require('./teardown')

const { expect } = chai

chai.use(dirtyChai)

module.exports = {
  expect,
  db,
  sql,
  setupCollections,
  truncateCollections,
  teardownCollections,
  populateCollections
}
