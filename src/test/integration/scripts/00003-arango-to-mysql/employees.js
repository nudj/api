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
  TABLES
} = require('../../../../lib/sql')
const {
  TABLE_ORDER,
  tableToCollection
} = require('../../../../scripts/00003-arango-to-mysql/helpers')

const script = require('../../../../scripts/00003-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00003 Arango to MySQL', () => {
  async function seedRun (data) {
    await populateCollections(db, data)
    await script({ db, sql, nosql })
  }

  before(async () => {
    await setupCollections(db, TABLE_ORDER.map(table => tableToCollection(table)))
    await setupCollections(nosql, ['referralIdMaps'])
  })

  afterEach(async () => {
    await truncateCollections(db)
    await truncateCollections(nosql)
  })

  after(async () => {
    await teardownCollections(db)
    await teardownCollections(nosql)
  })

  describe('for employees table', () => {
    const COLLECTIONS = {
      EMPLOYEES: tableToCollection(TABLES.EMPLOYEES),
      PEOPLE: tableToCollection(TABLES.PEOPLE),
      COMPANIES: tableToCollection(TABLES.COMPANIES)
    }

    afterEach(async () => {
      await sql(TABLES.EMPLOYEES).whereNot('id', '').del()
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
            name: COLLECTIONS.EMPLOYEES,
            data: [
              {
                _id: 'employees/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                person: 'person1',
                company: 'company1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.EMPLOYEES)

      it('should remap the relations', async () => {
        const employees = await sql.select().from(TABLES.EMPLOYEES)
        const people = await sql.select().from(TABLES.PEOPLE)
        const companies = await sql.select().from(TABLES.COMPANIES)
        expect(employees[0]).to.have.property('person', people[0].id)
        expect(employees[0]).to.have.property('company', companies[0].id)
      })
    })
  })
})
