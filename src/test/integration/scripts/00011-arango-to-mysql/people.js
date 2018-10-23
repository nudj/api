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
} = require('../../../../scripts/00011-arango-to-mysql/helpers')

const script = require('../../../../scripts/00011-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00011 Arango to MySQL', () => {
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

  describe('for people table', () => {
    const COLLECTIONS = {
      PEOPLE: TABLES.PEOPLE
    }

    afterEach(async () => {
      await sql(TABLES.PEOPLE).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.PEOPLE,
            data: [
              {
                _id: 'people/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                email: 'jim@bob.com',
                firstName: 'Jim',
                lastName: 'Bob',
                url: 'https://bob.com/',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.PEOPLE)

      it('should transfer all scalar properties', async () => {
        const records = await sql.select().from(TABLES.PEOPLE)
        expect(records[0]).to.have.property('firstName', 'Jim')
        expect(records[0]).to.have.property('lastName', 'Bob')
        expect(records[0]).to.have.property('email', 'jim@bob.com')
        expect(records[0]).to.have.property('url', 'https://bob.com/')
      })
    })

    describe('without optional properties', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.PEOPLE,
            data: [
              {
                _id: 'people/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                email: 'jim@bob.com'
              }
            ]
          }
        ])
      })

      it('should set to null', async () => {
        const records = await sql.select().from(TABLES.PEOPLE)
        expect(records[0]).to.have.property('firstName', null)
        expect(records[0]).to.have.property('lastName', null)
        expect(records[0]).to.have.property('url', null)
      })
    })

    describe('without null values for url', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.PEOPLE,
            data: [
              {
                _id: 'people/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                email: 'jim@bob.com',
                url: null
              }
            ]
          }
        ])
      })

      it('should set to sql NULL', async () => {
        const records = await sql.select().from(TABLES.PEOPLE)
        expect(records[0]).to.have.property('url', null)
      })
    })
  })
})
