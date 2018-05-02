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
  })

  afterEach(async () => {
    await truncateCollections(db)
    await truncateCollections(nosql)
    await teardownCollections(nosql)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('for accounts table', () => {
    const COLLECTIONS = {
      ACCOUNTS: TABLES.ACCOUNTS,
      PEOPLE: TABLES.PEOPLE
    }

    afterEach(async () => {
      await sql(TABLES.ACCOUNTS).whereNot('id', '').del()
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
              }
            ]
          },
          {
            name: COLLECTIONS.ACCOUNTS,
            data: [
              {
                _id: 'employments/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                email: 'email1@domain.com',
                emailAddresses: ['email1@domain.com', 'email2@domain.com'],
                data: { key: true },
                type: ENUMS.ACCOUNT_TYPES.GOOGLE,
                person: 'person1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.ACCOUNTS)

      it('should transfer all scalar properties', async () => {
        const accounts = await sql.select().from(TABLES.ACCOUNTS)
        expect(accounts[0]).to.have.property('emailAddresses', '["email1@domain.com","email2@domain.com"]')
        expect(accounts[0]).to.have.property('data', '{"key":true}')
        expect(accounts[0]).to.have.property('type', ENUMS.ACCOUNT_TYPES.GOOGLE)
      })

      it('should transfer emailAddress property to email field', async () => {
        const accounts = await sql.select().from(TABLES.ACCOUNTS)
        expect(accounts[0]).to.have.property('email', 'email1@domain.com')
      })

      it('should remap the relations', async () => {
        const accounts = await sql.select().from(TABLES.ACCOUNTS)
        const people = await sql.select().from(TABLES.PEOPLE)
        expect(accounts[0]).to.have.property('person', people[0].id)
      })
    })
  })
})
