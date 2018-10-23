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
  OLD_COLLECTIONS
} = require('../../../../scripts/00010-arango-to-mysql/helpers')

const script = require('../../../../scripts/00010-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00010 Arango to MySQL', () => {
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

  describe('for personRoles table', () => {
    const COLLECTIONS = {
      PERSON_ROLES: TABLES.PERSON_ROLES,
      PEOPLE: TABLES.PEOPLE,
      ROLES: TABLES.ROLES
    }

    afterEach(async () => {
      await sql(TABLES.CURRENT_PERSON_ROLES).whereNot('id', '').del()
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
                current: false,
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

      it('should remap the relations', async () => {
        const personRoles = await sql.select().from(TABLES.PERSON_ROLES)
        const people = await sql.select().from(TABLES.PEOPLE)
        const roles = await sql.select().from(TABLES.ROLES)
        expect(personRoles[0]).to.have.property('person', people[0].id)
        expect(personRoles[0]).to.have.property('role', roles[0].id)
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
                _key: 'personRole1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                current: true,
                person: 'person1',
                role: 'role1'
              }
            ]
          }
        ])
      })

      it('should create a currentPersonRoles record', async () => {
        const currentPersonRoles = await sql.select().from(TABLES.CURRENT_PERSON_ROLES)
        const personRoles = await sql.select().from(TABLES.PERSON_ROLES)
        expect(currentPersonRoles[0]).to.have.property('personRole', personRoles[0].id)
        expect(currentPersonRoles[0]).to.have.property('person', personRoles[0].person)
      })
    })
  })
})
