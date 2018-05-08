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
} = require('../../../../scripts/00003-arango-to-mysql/helpers')

const script = require('../../../../scripts/00003-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00003 Arango to MySQL', () => {
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

  describe('for employments table', () => {
    const COLLECTIONS = {
      EMPLOYMENTS: TABLES.EMPLOYMENTS,
      PEOPLE: TABLES.PEOPLE,
      COMPANIES: TABLES.COMPANIES
    }

    afterEach(async () => {
      await sql(TABLES.CURRENT_EMPLOYMENTS).whereNot('id', '').del()
      await sql(TABLES.EMPLOYMENTS).whereNot('id', '').del()
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
            name: COLLECTIONS.EMPLOYMENTS,
            data: [
              {
                _id: 'employments/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                current: false,
                source: ENUMS.DATA_SOURCES.MANUAL,
                person: 'person1',
                company: 'company1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.EMPLOYMENTS)

      it('should transfer all scalar properties', async () => {
        const employments = await sql.select().from(TABLES.EMPLOYMENTS)
        expect(employments[0]).to.have.property('source', ENUMS.DATA_SOURCES.MANUAL)
      })

      it('should remap the relations', async () => {
        const employments = await sql.select().from(TABLES.EMPLOYMENTS)
        const people = await sql.select().from(TABLES.PEOPLE)
        const companies = await sql.select().from(TABLES.COMPANIES)
        expect(employments[0]).to.have.property('person', people[0].id)
        expect(employments[0]).to.have.property('company', companies[0].id)
      })
    })

    describe('when current = true', () => {
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
            name: COLLECTIONS.EMPLOYMENTS,
            data: [
              {
                _id: 'employments/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                current: true,
                source: ENUMS.DATA_SOURCES.MANUAL,
                person: 'person1',
                company: 'company1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      it('should create a currentEmployments record', async () => {
        const currentEmployments = await sql.select().from(TABLES.CURRENT_EMPLOYMENTS)
        const employments = await sql.select().from(TABLES.EMPLOYMENTS)
        expect(currentEmployments[0]).to.have.property('employment', employments[0].id)
        expect(currentEmployments[0]).to.have.property('person', employments[0].person)
      })
    })
  })
})
