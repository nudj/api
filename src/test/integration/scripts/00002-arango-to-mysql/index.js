/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const isEqual = require('date-fns/is_equal')

const {
  db,
  sql,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const {
  TABLES
} = require('../../../../lib/sql')
const {
  TABLE_ORDER,
  tableToCollection
} = require('../../../../scripts/00002-arango-to-mysql/helpers')

const script = require('../../../../scripts/00002-arango-to-mysql')

chai.use(chaiAsPromised)

describe.only('00002 Arango to MySQL', () => {
  async function seedRun (data) {
    await populateCollections(db, data)
    await script({ db, sql })
  }

  before(async () => {
    await setupCollections(db, TABLE_ORDER.map(table => tableToCollection(table)))
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('for people table', () => {
    const TABLE = tableToCollection(TABLES.PEOPLE)

    beforeEach(async () => {
      await seedRun([
        {
          name: TABLE,
          data: [
            {
              _id: 'people/123',
              _rev: '_WpP1l3W---',
              _key: '123',
              created: '2018-02-01T01:02:03.456Z',
              modified: '2018-03-02T02:03:04.567Z',
              email: 'jim@bob.com',
              firstName: 'Jim',
              lastName: 'Bob',
              batchSize: 100,
              skip: 0
            }
          ]
        }
      ])
    })

    afterEach(async () => {
      await sql(TABLE).whereNot('id', '').del()
    })

    it('should create record for each item in collection', async () => {
      const records = await sql.select().from(TABLE)
      expect(records).to.have.length(1)
    })

    it('should convert dates to mysql timestamps', async () => {
      const records = await sql.select().from(TABLE)
      expect(records[0]).to.have.property('created')
      expect(isEqual(records[0].created, '2018-02-01 01:02:03'), 'created date was not inserted correctly').to.be.true()
      expect(records[0]).to.have.property('modified')
      // milliseconds are rounded to the nearest second
      expect(isEqual(records[0].modified, '2018-03-02 02:03:05'), 'modified date was not inserted correctly').to.be.true()
    })

    it('should transfer all scalar properties', async () => {
      const records = await sql.select().from(TABLE)
      expect(records[0]).to.have.property('firstName', 'Jim')
      expect(records[0]).to.have.property('lastName', 'Bob')
      expect(records[0]).to.have.property('email', 'jim@bob.com')
    })

    it('should not transfer extraneous properties', async () => {
      const records = await sql.select().from(TABLE)
      expect(records[0]).to.not.have.property('batchSize')
      expect(records[0]).to.not.have.property('skip')
    })
  })
})
