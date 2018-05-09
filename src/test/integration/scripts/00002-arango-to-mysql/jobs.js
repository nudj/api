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
  TABLES,
  ENUMS
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

  before(async () => {
    await setupCollections(db, TABLE_ORDER.map(table => tableToCollection(table)))
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('for jobs table', () => {
    const TABLE = tableToCollection(TABLES.JOBS)
    const TABLE_COMPANIES = tableToCollection(TABLES.COMPANIES)

    afterEach(async () => {
      await sql(TABLE).whereNot('id', '').del()
      await sql(TABLE_COMPANIES).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: TABLE_COMPANIES,
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
            name: TABLE,
            data: [
              {
                _id: 'jobs/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                title: 'Job title',
                slug: 'job-title',
                url: 'https://company.com/job',
                location: 'London',
                remuneration: '£5',
                template: 'some-template',
                description: 'A description',
                candidateDescription: 'A candidate description',
                roleDescription: 'A role description',
                experience: 'Some experience',
                requirements: 'Some requirements',
                bonus: 1000,
                status: ENUMS.JOB_STATUSES.DRAFT,
                company: 'company1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLE)

      it('should transfer all scalar properties', async () => {
        const records = await sql.select().from(TABLE)
        expect(records[0]).to.have.property('title', 'Job title')
        expect(records[0]).to.have.property('slug', 'job-title')
        expect(records[0]).to.have.property('url', 'https://company.com/job')
        expect(records[0]).to.have.property('location', 'London')
        expect(records[0]).to.have.property('remuneration', '£5')
        expect(records[0]).to.have.property('template', 'some-template')
        expect(records[0]).to.have.property('description', 'A description')
        expect(records[0]).to.have.property('candidateDescription', 'A candidate description')
        expect(records[0]).to.have.property('roleDescription', 'A role description')
        expect(records[0]).to.have.property('experience', 'Some experience')
        expect(records[0]).to.have.property('requirements', 'Some requirements')
        expect(records[0]).to.have.property('bonus', 1000)
        expect(records[0]).to.have.property('status', ENUMS.JOB_STATUSES.DRAFT)
      })

      it('should remap the relations', async () => {
        const jobs = await sql.select().from(TABLE)
        const companies = await sql.select().from(TABLE_COMPANIES)
        expect(jobs[0]).to.have.property('company', companies[0].id)
      })
    })

    describe('without optional properties', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: TABLE_COMPANIES,
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
            name: TABLE,
            data: [
              {
                _id: 'jobs/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                title: 'Job title',
                slug: 'job-title',
                bonus: 1000,
                company: 'company1'
              }
            ]
          }
        ])
      })

      it('should use defaults', async () => {
        const records = await sql.select().from(TABLE)
        expect(records[0]).to.have.property('status', ENUMS.JOB_STATUSES.DRAFT)
      })

      it('should set null', async () => {
        const records = await sql.select().from(TABLE)
        expect(records[0]).to.have.property('url', null)
        expect(records[0]).to.have.property('location', null)
        expect(records[0]).to.have.property('remuneration', null)
        expect(records[0]).to.have.property('template', null)
        expect(records[0]).to.have.property('description', null)
        expect(records[0]).to.have.property('candidateDescription', null)
        expect(records[0]).to.have.property('roleDescription', null)
        expect(records[0]).to.have.property('experience', null)
        expect(records[0]).to.have.property('requirements', null)
      })
    })
  })
})
