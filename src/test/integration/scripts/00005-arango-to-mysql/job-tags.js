/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const {
  db,
  sql,
  nosql,
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
} = require('../../../../scripts/00006-arango-to-mysql/helpers')

const script = require('../../../../scripts/00006-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00005 Arango to MySQL', () => {
  async function seedRun (data) {
    await populateCollections(db, data)
    await script({ db, sql, nosql })
  }

  before(async () => {
    await setupCollections(db, Object.values(OLD_COLLECTIONS))
  })

  afterEach(async () => {
    await truncateCollections(db)
    await truncateCollections(nosql)
    await teardownCollections(nosql)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('for jobTags table', () => {
    const COLLECTIONS = {
      JOB_TAGS: TABLES.JOB_TAGS,
      JOBS: TABLES.JOBS,
      TAGS: TABLES.TAGS,
      COMPANIES: TABLES.COMPANIES
    }

    afterEach(async () => {
      await sql(TABLES.JOB_TAGS).whereNot('id', '').del()
      await sql(TABLES.TAGS).whereNot('id', '').del()
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
            name: COLLECTIONS.TAGS,
            data: [
              {
                _key: 'tag1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                name: 'Tag',
                type: ENUMS.TAG_TYPES.EXPERTISE
              }
            ]
          },
          {
            name: COLLECTIONS.JOB_TAGS,
            data: [
              {
                _id: 'tags/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                source: ENUMS.DATA_SOURCES.MANUAL,
                job: 'job1',
                tag: 'tag1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.JOB_TAGS)

      it('should transfer all scalar properties', async () => {
        const jobTags = await sql.select().from(TABLES.JOB_TAGS)
        expect(jobTags[0]).to.have.property('source', ENUMS.DATA_SOURCES.MANUAL)
      })

      it('should remap the relations', async () => {
        const jobTags = await sql.select().from(TABLES.JOB_TAGS)
        const jobs = await sql.select().from(TABLES.JOBS)
        const tags = await sql.select().from(TABLES.TAGS)
        expect(jobTags[0]).to.have.property('job', jobs[0].id)
        expect(jobTags[0]).to.have.property('tag', tags[0].id)
      })
    })
  })
})
