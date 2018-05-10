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

  before(async () => {
    await setupCollections(db, TABLE_ORDER.map(table => tableToCollection(table)))
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  describe('for tags table', () => {
    const COLLECTIONS = {
      TAGS: tableToCollection(TABLES.TAGS)
    }

    afterEach(async () => {
      await sql(TABLES.TAGS).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
          {
            name: COLLECTIONS.TAGS,
            data: [
              {
                _id: 'tags/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                name: 'Tag',
                type: ENUMS.TAG_TYPES.EXPERTISE,
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.TAGS)

      it('should transfer all scalar properties', async () => {
        const tags = await sql.select().from(TABLES.TAGS)
        expect(tags[0]).to.have.property('name', 'Tag')
        expect(tags[0]).to.have.property('type', ENUMS.TAG_TYPES.EXPERTISE)
      })
    })
  })
})
