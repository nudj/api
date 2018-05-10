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

describe('00002 Arango to MySQL', () => {
  async function seedRun (data) {
    await populateCollections(db, data)
    await script({ db, sql })
  }

  function genericExpectationsForTable (table, count = 1) {
    it('should create record for each item in collection', async () => {
      const records = await sql.select().from(table)
      expect(records).to.have.length(count)
    })

    it('should convert dates to mysql timestamps', async () => {
      const records = await sql.select().from(table).orderBy('created', 'asc')
      expect(records[0]).to.have.property('created')
      expect(isEqual(records[0].created, '2018-02-01 01:02:03'), 'created date was not inserted correctly').to.be.true()
      expect(records[0]).to.have.property('modified')
      // milliseconds are rounded to the nearest second
      expect(isEqual(records[0].modified, '2018-03-02 02:03:05'), 'modified date was not inserted correctly').to.be.true()
    })

    it('should not transfer extraneous properties', async () => {
      const records = await sql.select().from(table)
      expect(records[0]).to.not.have.property('batchSize')
      expect(records[0]).to.not.have.property('skip')
    })
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

  describe('for viewEvents table', () => {
    const COLLECTIONS = {
      VIEW_EVENTS: tableToCollection(TABLES.VIEW_EVENTS),
      COMPANIES: tableToCollection(TABLES.COMPANIES),
      JOBS: tableToCollection(TABLES.JOBS)
    }

    afterEach(async () => {
      await sql(TABLES.VIEW_EVENTS).whereNot('id', '').del()
      await sql(TABLES.JOBS).whereNot('id', '').del()
      await sql(TABLES.COMPANIES).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.COMPANIES,
            data: [
              {
                _key: 'company1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                name: 'Company Ltd',
                slug: 'company-ltd'
              }
            ]
          },
          {
            name: COLLECTIONS.JOBS,
            data: [
              {
                _key: 'job1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                title: 'Job title',
                slug: 'job-title',
                bonus: 1000,
                company: 'company1'
              }
            ]
          },
          {
            name: COLLECTIONS.VIEW_EVENTS,
            data: [
              {
                _id: 'employments/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                browserId: 'abc123',
                job: 'job1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.VIEW_EVENTS)

      it('should transfer all scalar properties', async () => {
        const personRoles = await sql.select().from(TABLES.VIEW_EVENTS)
        expect(personRoles[0]).to.have.property('browserId', 'abc123')
      })

      it('should remap the relations', async () => {
        const personRoles = await sql.select().from(TABLES.VIEW_EVENTS)
        const jobs = await sql.select().from(TABLES.JOBS)
        expect(personRoles[0]).to.have.property('job', jobs[0].id)
      })
    })
  })
})
