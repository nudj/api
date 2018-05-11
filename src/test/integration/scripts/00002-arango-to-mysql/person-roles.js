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

  describe('for personRoles table', () => {
    const COLLECTIONS = {
      PERSON_ROLES: tableToCollection(TABLES.PERSON_ROLES),
      PEOPLE: tableToCollection(TABLES.PEOPLE),
      ROLES: tableToCollection(TABLES.ROLES)
    }

    afterEach(async () => {
      await sql(TABLES.PERSON_ROLES).whereNot('id', '').del()
      await sql(TABLES.PEOPLE).whereNot('id', '').del()
      await sql(TABLES.ROLES).whereNot('id', '').del()
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
            name: COLLECTIONS.PERSON_ROLES,
            data: [
              {
                _id: 'employments/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                current: true,
                person: 'person1',
                role: 'role1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.PERSON_ROLES)

      it('should transfer all scalar properties', async () => {
        const personRoles = await sql.select().from(TABLES.PERSON_ROLES)
        expect(personRoles[0]).to.have.property('current', 1)
      })

      it('should remap the relations', async () => {
        const personRoles = await sql.select().from(TABLES.PERSON_ROLES)
        const people = await sql.select().from(TABLES.PEOPLE)
        const roles = await sql.select().from(TABLES.ROLES)
        expect(personRoles[0]).to.have.property('person', people[0].id)
        expect(personRoles[0]).to.have.property('role', roles[0].id)
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
            name: COLLECTIONS.PERSON_ROLES,
            data: [
              {
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                person: 'person1',
                role: 'role1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      it('should use defaults', async () => {
        const personRoles = await sql.select().from(TABLES.PERSON_ROLES)
        expect(personRoles[0]).to.have.property('current', 0)
      })
    })
  })
})
