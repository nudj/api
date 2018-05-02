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
  expect
} = require('../../lib')
const {
  TABLES,
  COLLECTIONS
} = require('../../../../lib/sql')
const {
  OLD_COLLECTIONS
} = require('../../../../scripts/00005-arango-to-mysql/helpers')

const script = require('../../../../scripts/00005-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00005 Arango to MySQL', () => {
  async function seedRun (data) {
    await populateCollections(db, data)
    await script({ db, sql, nosql })
  }

  before(async () => {
    await setupCollections(db, Object.values(OLD_COLLECTIONS))
    await setupCollections(nosql, Object.values(COLLECTIONS))
  })

  afterEach(async () => {
    await truncateCollections(db)
    await truncateCollections(nosql)
  })

  after(async () => {
    await teardownCollections(nosql)
    await teardownCollections(db)
  })

  describe('for jobViewEvents collection', () => {
    afterEach(async () => {
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
                slug: 'company-ltd'
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

      it('should copy item from old events collection to new jobViewEvents collection', async () => {
        const jobViewEventsCollectionCursor = await nosql.collection(COLLECTIONS.JOB_VIEW_EVENTS)
        const jobViewEventsAllCursor = await jobViewEventsCollectionCursor.all()
        const jobViewEventsAll = await jobViewEventsAllCursor.all()

        const jobs = await sql.select().from(TABLES.JOBS)

        expect(jobViewEventsAll[0]).to.have.property('created', '2018-02-01 01:02:03')
        expect(jobViewEventsAll[0]).to.have.property('modified', '2018-03-02 02:03:04')
        expect(jobViewEventsAll[0]).to.have.property('job', jobs[0].id)
        expect(jobViewEventsAll[0]).to.have.property('browserId', 'abc123')
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
                slug: 'company-ltd'
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
        const jobViewEventsCollectionCursor = await nosql.collection(COLLECTIONS.JOB_VIEW_EVENTS)
        const jobViewEventsAllCursor = await jobViewEventsCollectionCursor.all()
        const jobViewEventsAll = await jobViewEventsAllCursor.all()

        expect(jobViewEventsAll).to.have.length(2)
      })
    })
  })
})
