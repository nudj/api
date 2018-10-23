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

  describe('for roles table', () => {
    const COLLECTIONS = {
      ROLES: TABLES.ROLES
    }

    afterEach(async () => {
      await sql(TABLES.ROLES).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.ROLES,
            data: [
              {
                _id: 'roles/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                name: 'Role name',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.ROLES)

      it('should transfer all scalar properties', async () => {
        const roles = await sql.select().from(TABLES.ROLES)
        expect(roles[0]).to.have.property('name', 'Role name')
      })
    })
  })
})
