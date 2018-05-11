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
  })

  afterEach(async () => {
    await truncateCollections(db)
    await truncateCollections(nosql)
    await teardownCollections(nosql)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('for connections table', () => {
    const COLLECTIONS = {
      CONNECTIONS: tableToCollection(TABLES.CONNECTIONS),
      PEOPLE: tableToCollection(TABLES.PEOPLE),
      COMPANIES: tableToCollection(TABLES.COMPANIES),
      ROLES: tableToCollection(TABLES.ROLES)
    }

    afterEach(async () => {
      await sql(TABLES.CONNECTIONS).whereNot('id', '').del()
      await sql(TABLES.ROLES).whereNot('id', '').del()
      await sql(TABLES.COMPANIES).whereNot('id', '').del()
      await sql(TABLES.PEOPLE).whereNot('id', '').del()
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
                email: 'jom@bib.com'
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
            name: COLLECTIONS.ROLES,
            data: [
              {
                _key: 'role1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                name: 'Role name'
              }
            ]
          },
          {
            name: COLLECTIONS.CONNECTIONS,
            data: [
              {
                _id: 'applications/123',
                _rev: '_WpP1l3W---',
                _key: 'application1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                firstName: 'Jom',
                lastName: 'Bib',
                source: ENUMS.DATA_SOURCES.LINKEDIN,
                person: 'person2',
                from: 'person1',
                role: 'role1',
                company: 'company1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.CONNECTIONS)

      it('should transfer all scalar properties', async () => {
        const connections = await sql.select().from(TABLES.CONNECTIONS)
        expect(connections[0]).to.have.property('firstName', 'Jom')
        expect(connections[0]).to.have.property('lastName', 'Bib')
        expect(connections[0]).to.have.property('source', ENUMS.DATA_SOURCES.LINKEDIN)
      })

      it('should remap the relations', async () => {
        const connections = await sql.select().from(TABLES.CONNECTIONS)
        const roles = await sql.select().from(TABLES.ROLES)
        const companies = await sql.select().from(TABLES.COMPANIES)
        const people = await sql.select().from(TABLES.PEOPLE).orderBy('created', 'asc')

        expect(connections[0]).to.have.property('from', people[0].id)
        expect(connections[0]).to.have.property('person', people[1].id)
        expect(connections[0]).to.have.property('company', companies[0].id)
        expect(connections[0]).to.have.property('role', roles[0].id)
      })
    })

    describe('without optional properties', () => {
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
                email: 'jom@bib.com'
              }
            ]
          },
          {
            name: COLLECTIONS.CONNECTIONS,
            data: [
              {
                _key: 'application1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                firstName: 'Jom',
                lastName: 'Bib',
                source: ENUMS.DATA_SOURCES.LINKEDIN,
                person: 'person2',
                from: 'person1'
              }
            ]
          }
        ])
      })

      it('should set null', async () => {
        const connections = await sql.select().from(TABLES.CONNECTIONS)
        expect(connections[0]).to.have.property('role', null)
        expect(connections[0]).to.have.property('company', null)
      })
    })
  })
})
