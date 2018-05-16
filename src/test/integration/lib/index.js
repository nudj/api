/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
const isEqual = require('date-fns/is_equal')

const db = require('./db')
const sql = require('./sql')
const nosql = require('./nosql')
const { setupCollections, populateCollections } = require('./setup')
const { truncateCollections, teardownCollections } = require('./teardown')

const { expect } = chai

chai.use(sinonChai)
chai.use(dirtyChai)
chai.use(chaiAsPromised)

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
    expect(isEqual(records[0].modified, '2018-03-02 02:03:04'), 'modified date was not inserted correctly').to.be.true()
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
  nosql,
  setupCollections,
  truncateCollections,
  teardownCollections,
  populateCollections,
  genericExpectationsForTable
}
