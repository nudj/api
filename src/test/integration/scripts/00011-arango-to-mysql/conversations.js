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

  describe('for conversations table', () => {
    const COLLECTIONS = {
      CONVERSATIONS: TABLES.CONVERSATIONS,
      PEOPLE: TABLES.PEOPLE
    }

    afterEach(async () => {
      await sql(TABLES.CONVERSATIONS).whereNot('id', '').del()
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
                email: 'jim@bob.com'
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
            name: COLLECTIONS.CONVERSATIONS,
            data: [
              {
                _id: 'conversations/123',
                _rev: '_WpP1l3W---',
                _key: '123',
                created: '2018-02-01T01:02:03.456Z',
                modified: '2018-03-02T02:03:04.567Z',
                threadId: 'abc123',
                type: ENUMS.ACCOUNT_TYPES.GOOGLE,
                person: 'person1',
                recipient: 'person2',
                batchSize: 100,
                skip: 0
              }
            ]
          }
        ])
      })

      genericExpectationsForTable(TABLES.CONVERSATIONS)

      it('should transfer all scalar properties', async () => {
        const conversations = await sql.select().from(TABLES.CONVERSATIONS)
        expect(conversations[0]).to.have.property('threadId', 'abc123')
        expect(conversations[0]).to.have.property('type', ENUMS.ACCOUNT_TYPES.GOOGLE)
      })

      it('should remap the relations', async () => {
        const conversations = await sql.select().from(TABLES.CONVERSATIONS)
        const people = await sql.select().from(TABLES.PEOPLE).orderBy('created', 'asc')
        expect(conversations[0]).to.have.property('person', people[0].id)
        expect(conversations[0]).to.have.property('recipient', people[1].id)
      })
    })
  })
})
