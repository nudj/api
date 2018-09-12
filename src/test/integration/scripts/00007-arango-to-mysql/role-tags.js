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
  OLD_COLLECTIONS
} = require('../../../../scripts/00007-arango-to-mysql/helpers')

const script = require('../../../../scripts/00007-arango-to-mysql')

chai.use(chaiAsPromised)

describe('00007 Arango to MySQL', () => {
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

  describe('for roleTags table', () => {
    const COLLECTIONS = {
      ROLE_TAGS: TABLES.ROLE_TAGS,
      ROLES: TABLES.ROLES,
      TAGS: TABLES.TAGS
    }

    afterEach(async () => {
      await sql(TABLES.ROLE_TAGS).whereNot('id', '').del()
      await sql(TABLES.ROLES).whereNot('id', '').del()
      await sql(TABLES.TAGS).whereNot('id', '').del()
    })

    describe('with a full data set', () => {
      beforeEach(async () => {
        await seedRun([
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
            name: COLLECTIONS.TAGS,
            data: [
              {
                _key: 'tag1',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                name: 'Tag',
                type: ENUMS.TAG_TYPES.EXPERTISE
              }
            ]
          },
          {
            name: COLLECTIONS.ROLE_TAGS,
            data: [
              {
                _id: 'tags/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                source: ENUMS.DATA_SOURCES.MANUAL,
                role: 'role1',
                tag: 'tag1',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.ROLE_TAGS)

      it('should transfer all scalar properties', async () => {
        const roleTags = await sql.select().from(TABLES.ROLE_TAGS)
        expect(roleTags[0]).to.have.property('source', ENUMS.DATA_SOURCES.MANUAL)
      })

      it('should remap the relations', async () => {
        const roleTags = await sql.select().from(TABLES.ROLE_TAGS)
        const roles = await sql.select().from(TABLES.ROLES)
        const tags = await sql.select().from(TABLES.TAGS)
        expect(roleTags[0]).to.have.property('role', roles[0].id)
        expect(roleTags[0]).to.have.property('tag', tags[0].id)
      })
    })
  })
})
