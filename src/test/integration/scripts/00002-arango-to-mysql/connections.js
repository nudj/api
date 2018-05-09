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

describe('00002 Arango to MySQL', () => {
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

  describe('for connections table', () => {
    const TABLE = tableToCollection(TABLES.CONNECTIONS)
    const TABLE_PEOPLE = tableToCollection(TABLES.PEOPLE)
    const TABLE_COMPANIES = tableToCollection(TABLES.COMPANIES)
    const TABLE_ROLES = tableToCollection(TABLES.ROLES)

    afterEach(async () => {
      await sql(TABLE).whereNot('id', '').del()
      await sql(TABLE_ROLES).whereNot('id', '').del()
      await sql(TABLE_COMPANIES).whereNot('id', '').del()
      await sql(TABLE_PEOPLE).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: TABLE_PEOPLE,
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
            name: TABLE_ROLES,
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
            name: TABLE,
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

      genericExpectationsForTable(TABLE)

      it('should transfer all scalar properties', async () => {
        const connections = await sql.select().from(TABLE)
        expect(connections[0]).to.have.property('firstName', 'Jom')
        expect(connections[0]).to.have.property('lastName', 'Bib')
        expect(connections[0]).to.have.property('source', ENUMS.DATA_SOURCES.LINKEDIN)
      })

      it('should remap the relations', async () => {
        const connections = await sql.select().from(TABLE)
        const roles = await sql.select().from(TABLE_ROLES)
        const companies = await sql.select().from(TABLE_COMPANIES)
        const people = await sql.select().from(TABLE_PEOPLE).orderBy('created', 'asc')

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
            name: TABLE_PEOPLE,
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
            name: TABLE,
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
        const connections = await sql.select().from(TABLE)
        expect(connections[0]).to.have.property('role', null)
        expect(connections[0]).to.have.property('company', null)
      })
    })
  })
})
