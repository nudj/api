/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const isEqual = require('date-fns/is_equal')

const db = require('./db')
const sql = require('./sql')
const { setupCollections, populateCollections } = require('./setup')
const { truncateCollections, teardownCollections } = require('./teardown')

const { expect } = chai

chai.use(dirtyChai)

function genericExpectationsForTable (TABLE, count = 1) {
  it('should create record for each item in collection', async () => {
    const records = await sql.select().from(TABLE)
    expect(records).to.have.length(count)
  })

  it('should convert dates to mysql timestamps', async () => {
    const records = await sql.select().from(TABLE).orderBy('created', 'asc')
    expect(records[0]).to.have.property('created')
    expect(isEqual(records[0].created, '2018-02-01 01:02:03'), 'created date was not inserted correctly').to.be.true()
    expect(records[0]).to.have.property('modified')
    // milliseconds are rounded to the nearest second
    expect(isEqual(records[0].modified, '2018-03-02 02:03:05'), 'modified date was not inserted correctly').to.be.true()
  })

  it('should not transfer extraneous properties', async () => {
    const records = await sql.select().from(TABLE)
    expect(records[0]).to.not.have.property('batchSize')
    expect(records[0]).to.not.have.property('skip')
  })
}

module.exports = {
  expect,
  db,
  sql,
  setupCollections,
  truncateCollections,
  teardownCollections,
  populateCollections,
  genericExpectationsForTable
}
