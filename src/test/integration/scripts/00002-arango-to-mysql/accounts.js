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

  describe('for accounts table', () => {
    const COLLECTIONS = {
      ACCOUNTS: tableToCollection(TABLES.ACCOUNTS),
      PEOPLE: tableToCollection(TABLES.PEOPLE)
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
                emailAddresses: JSON.stringify(['email1@domain.com', 'email2@domain.com']),
                data: JSON.stringify({ key: true }),
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
        expect(accounts[0]).to.have.property('email', 'email1@domain.com')
        expect(accounts[0]).to.have.property('emailAddresses', '["email1@domain.com","email2@domain.com"]')
        expect(accounts[0]).to.have.property('data', '{"key":true}')
        expect(accounts[0]).to.have.property('type', ENUMS.ACCOUNT_TYPES.GOOGLE)
      })

      it('should remap the relations', async () => {
        const accounts = await sql.select().from(TABLES.ACCOUNTS)
        const people = await sql.select().from(TABLES.PEOPLE)
        expect(accounts[0]).to.have.property('person', people[0].id)
      })
    })
  })
})
