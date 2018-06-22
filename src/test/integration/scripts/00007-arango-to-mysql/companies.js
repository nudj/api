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
  OLD_COLLECTIONS
} = require('../../../../scripts/00007-arango-to-mysql/helpers')

const script = require('../../../../scripts/00007-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00007 Arango to MySQL', () => {
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

  describe('for companies table', () => {
    const COLLECTIONS = {
      COMPANIES: TABLES.COMPANIES
    }

    afterEach(async () => {
      await sql(TABLES.COMPANIES).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.COMPANIES,
            data: [
              {
                _id: 'companies/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                name: 'Company Ltd',
                slug: 'company-ltd',
                client: true,
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.COMPANIES)

      it('should transfer all scalar properties', async () => {
        const records = await sql.select().from(TABLES.COMPANIES)
        expect(records[0]).to.have.property('name', 'Company Ltd')
        expect(records[0]).to.have.property('slug', 'company-ltd')
        // booleans returns as 1 or 0
        expect(records[0]).to.have.property('client', 1)
      })
    })

    describe('without optional properties', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.COMPANIES,
            data: [
              {
                _id: 'companies/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                name: 'Company Ltd',
                slug: 'company-ltd'
              }
            ]
          }
        ])
      })

      it('should use defaults', async () => {
        const records = await sql.select().from(TABLES.COMPANIES)
        expect(records[0]).to.have.property('client', 0)
      })
    })

    describe('when created/modified are missing', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.COMPANIES,
            data: [
              {
                _id: 'companies/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                name: 'Company Ltd',
                slug: 'company-ltd'
              }
            ]
          }
        ])
      })

      it('should use defaults', async () => {
        const records = await sql.select().from(TABLES.COMPANIES)
        expect(records[0]).to.have.property('client', 0)
      })
    })
  })
})
