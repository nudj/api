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
  TABLES
} = require('../../../../lib/sql')
const {
  TABLE_ORDER,
  tableToCollection
} = require('../../../../scripts/00003-arango-to-mysql/helpers')

const script = require('../../../../scripts/00003-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00002 Arango to MySQL', () => {
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

  describe('for referrals table', () => {
    const COLLECTIONS = {
      REFERRALS: tableToCollection(TABLES.REFERRALS),
      PEOPLE: tableToCollection(TABLES.PEOPLE),
      COMPANIES: tableToCollection(TABLES.COMPANIES),
      JOBS: tableToCollection(TABLES.JOBS)
    }

    afterEach(async () => {
      await sql(TABLES.REFERRALS).where('created', '2019-02-01 01:02:03').del()
      await sql(TABLES.REFERRALS).where('created', '2018-02-01 01:02:03').del()
      await sql(TABLES.JOBS).whereNot('id', '').del()
      await sql(TABLES.PEOPLE).whereNot('id', '').del()
      await sql(TABLES.COMPANIES).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.PEOPLE,
            data: [
              {
                _key: 'person1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                email: 'jim@bob.com',
                firstName: 'Jim',
                lastName: 'Bob'
              },
              {
                _key: 'person2',
                created: '2019-02-01T01:02:03.456Z',
                modified: '2019-03-02T02:03:04.567Z',
                email: 'jom@bib.com',
                firstName: 'Jom',
                lastName: 'Bib'
              }
            ]
          },
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
            name: COLLECTIONS.REFERRALS,
            data: [
              {
                _id: 'referrals/123',
                _rev: '_WpP1l3W---',
                _key: 'referral1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                person: 'person1',
                job: 'job1',
                batchSize: 100,
                skip: 0
              },
              {
                _id: 'referrals/234',
                _rev: '_WpP1l3W---',
                _key: 'referral2',
                created: '2019-02-01T01:02:03.456Z',
                modified: '2019-03-02T02:03:04.567Z',
                person: 'person2',
                job: 'job1',
                parent: 'referral1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.REFERRALS, 2)

      it('should remap the relations', async () => {
        const referrals = await sql.select().from(TABLES.REFERRALS).orderBy('created', 'asc')
        const jobs = await sql.select().from(TABLES.JOBS).orderBy('created', 'asc')
        const people = await sql.select().from(TABLES.PEOPLE).orderBy('created', 'asc')

        expect(referrals[0]).to.have.property('job', jobs[0].id)
        expect(referrals[0]).to.have.property('person', people[0].id)

        expect(referrals[1]).to.have.property('job', jobs[0].id)
        expect(referrals[1]).to.have.property('person', people[1].id)
        expect(referrals[1]).to.have.property('parent', referrals[0].id)
      })

      it('should use defaults', async () => {
        const referrals = await sql.select().from(TABLES.REFERRALS).orderBy('created', 'asc')
        expect(referrals[0]).to.have.property('parent', null)
      })
    })
  })
})
