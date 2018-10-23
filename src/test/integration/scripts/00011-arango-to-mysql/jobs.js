/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const {
  db,
  sql,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect,
  genericExpectationsForTable
} = require('../../lib')
const {
  TABLES,
  ENUMS
} = require('../../../../lib/sql')
const {
  OLD_COLLECTIONS
} = require('../../../../scripts/00011-arango-to-mysql/helpers')

const script = require('../../../../scripts/00011-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00011 Arango to MySQL', () => {
  async function seedRun (data) {
    await populateCollections(db, data)
    await script({ db, sql })
  }

  before(async () => {
    await setupCollections(db, Object.values(OLD_COLLECTIONS))
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('for jobs table', () => {
    const COLLECTIONS = {
      JOBS: TABLES.JOBS,
      COMPANIES: TABLES.COMPANIES
    }

    afterEach(async () => {
      await sql(TABLES.RELATED_JOBS).whereNot('id', '').del()
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
                slug: 'company-ltd',
                hash: '123'
              }
            ]
          },
          {
            name: COLLECTIONS.JOBS,
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
                templateTags: ['some-template'],
                description: 'A description',
                candidateDescription: 'A candidate description',
                roleDescription: 'A role description',
                experience: 'Some experience',
                requirements: 'Some requirements',
                bonus: '1000',
                status: ENUMS.JOB_STATUSES.DRAFT,
                company: 'company1',
                relatedJobs: ['456'],
                batchSize: 100,
                skip: 0
              },
              {
                _id: 'jobs/456',
                _rev: '_WpP1l3W---',
                _key: '456',
                created: '2019-02-01T01:02:03.456Z',
                modified: '2019-03-02T02:03:04.567Z',
                title: 'Job title two',
                slug: 'job-title-two',
                url: 'https://company.com/job',
                location: 'London',
                remuneration: '£5',
                templateTags: ['some-template'],
                description: 'A description',
                candidateDescription: 'A candidate description',
                roleDescription: 'A role description',
                experience: 'Some experience',
                requirements: 'Some requirements',
                bonus: '1000',
                status: ENUMS.JOB_STATUSES.DRAFT,
                company: 'company1'
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.JOBS, 2)

      it('should transfer scalar properties', async () => {
        const records = await sql.select().from(TABLES.JOBS).orderBy('created', 'asc')
        expect(records[0]).to.have.property('title', 'Job title')
        expect(records[0]).to.have.property('slug', 'job-title')
        expect(records[0]).to.have.property('url', 'https://company.com/job')
        expect(records[0]).to.have.property('location', 'London')
        expect(records[0]).to.have.property('remuneration', '£5')
        expect(records[0]).to.have.property('description', 'A description')
        expect(records[0]).to.have.property('candidateDescription', 'A candidate description')
        expect(records[0]).to.have.property('roleDescription', 'A role description')
        expect(records[0]).to.have.property('experience', 'Some experience')
        expect(records[0]).to.have.property('requirements', 'Some requirements')
        expect(records[0]).to.have.property('bonus', '1000')
        expect(records[0]).to.have.property('status', ENUMS.JOB_STATUSES.DRAFT)
      })

      it('should remap the relations', async () => {
        const jobs = await sql.select().from(TABLES.JOBS)
        const companies = await sql.select().from(TABLES.COMPANIES)
        expect(jobs[0]).to.have.property('company', companies[0].id)
      })

      it('should map templateTags to template', async () => {
        const jobs = await sql.select().from(TABLES.JOBS)
        expect(jobs[0]).to.have.property('template', 'some-template')
      })

      it('should add entries to relatedJobs', async () => {
        const relatedJobs = await sql.select().from(TABLES.RELATED_JOBS)
        expect(relatedJobs).to.have.length(1)
      })
    })

    describe('without optional properties', () => {
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
                slug: 'company-ltd',
                hash: '123'
              }
            ]
          },
          {
            name: COLLECTIONS.JOBS,
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
        const records = await sql.select().from(TABLES.JOBS)
        expect(records[0]).to.have.property('status', ENUMS.JOB_STATUSES.DRAFT)
      })

      it('should set null', async () => {
        const records = await sql.select().from(TABLES.JOBS)
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
