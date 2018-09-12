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
  expect
} = require('../../lib')
const {
  TABLES
} = require('../../../../lib/sql')
const {
  OLD_COLLECTIONS
} = require('../../../../scripts/00007-arango-to-mysql/helpers')

const script = require('../../../../scripts/00007-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00007 Arango to MySQL', () => {
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

  describe('for jobViewEvents table', () => {
    afterEach(async () => {
      await sql(TABLES.JOB_VIEW_EVENTS).whereNot('id', '').del()
      await sql(TABLES.JOBS).whereNot('id', '').del()
      await sql(TABLES.COMPANIES).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: OLD_COLLECTIONS.COMPANIES,
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
            name: OLD_COLLECTIONS.JOBS,
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
            name: OLD_COLLECTIONS.EVENTS,
            data: [
              {
                _id: 'events/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                browserId: 'abc123',
                entityId: 'job1',
                entityType: 'jobs',
                eventType: 'viewed',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      it('should copy item from old events collection to new jobViewEvents table', async () => {
        const jobs = await sql.select().from(TABLES.JOBS)
        const jobViewEvents = await sql.select().from(TABLES.JOB_VIEW_EVENTS)
        expect(jobViewEvents[0]).to.have.property('job', jobs[0].id)
        expect(jobViewEvents[0]).to.have.property('browserId', 'abc123')
      })
    })

    describe('when multiple views are recorded for the same job/browser', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: OLD_COLLECTIONS.COMPANIES,
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
            name: OLD_COLLECTIONS.JOBS,
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
            name: OLD_COLLECTIONS.EVENTS,
            data: [
              {
                _key: 'event1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                browserId: 'abc123',
                entityId: 'job1',
                entityType: 'jobs',
                eventType: 'viewed'
              },
              {
                _key: 'event2',
                created: '2019-02-01T01:02:03.456Z',
                modified: '2019-03-02T02:03:04.567Z',
                browserId: 'abc123',
                entityId: 'job1',
                entityType: 'jobs',
                eventType: 'viewed'
              }
            ]
          }
        ])
      })

      it('should create one entry per event', async () => {
        const jobViewEvents = await sql.select().from(TABLES.JOB_VIEW_EVENTS)
        expect(jobViewEvents).to.have.length(2)
      })
    })
  })
})
