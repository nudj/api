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
  expect
} = require('../../lib')
const {
  TABLES
} = require('../../../../lib/sql')
const {
  TABLE_ORDER,
  tableToCollection
} = require('../../../../scripts/00002-arango-to-mysql/helpers')

const script = require('../../../../scripts/00002-arango-to-mysql')

chai.use(chaiAsPromised)

describe.only('00002 Arango to MySQL', () => {
  const TABLE = tableToCollection(TABLES.PEOPLE)

  before(async () => {
    await setupCollections(db, TABLE_ORDER.map(table => tableToCollection(table)))
  })

  beforeEach(async () => {
    await populateCollections(db, [
      {
        name: TABLE,
        data: [
          {
            _id: 'TABLE/123',
            _rev: '_WpP1l3W---',
            _key: '123',
            firstName: 'Jim',
            lastName: 'Bob',
            email: 'jim@bob.com',
            created: '2018-02-01T01:02:03.456Z',
            modified: '2018-03-02T02:03:04.567Z'
          }
        ]
      }
    ])
  })

  afterEach(async () => {
    await truncateCollections(db)
    await sql(TABLE).whereNot('id', '').del()
  })

  after(async () => {
    await teardownCollections(db)
  })

  it('should create record for each item in collection', async () => {
    await script({ db, sql })
    return expect(await sql.select().from(TABLE)).to.have.length(1)
  })
})
