/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const orderBy = require('lodash/orderBy')

const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const migration = require('../../../../migrations/00020-add-hashes-to-companies')

chai.use(chaiAsPromised)

describe('00020 Add hashes to companies', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  before(async () => {
    await setupCollections(db, ['companies'])
  })

  beforeEach(async () => {
    await populateCollections(db, [
      {
        name: 'companies',
        data: [
          {
            _key: 'company1'
          },
          {
            _key: 'company2'
          },
          {
            _key: 'company3',
            hash: 'EXISTING_HASH'
          }
        ]
      }
    ])
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  it('adds the hash to all companies', async () => {
    await executeMigration({ direction: 'up' })
    const collection = db.collection('companies')
    const cursor = await collection.all()
    const companies = orderBy(await cursor.all(), '_key')

    expect(companies[0]).to.have.property('hash').to.match(/[a-z0-9]{128}/)
    expect(companies[1]).to.have.property('hash').to.match(/[a-z0-9]{128}/)
  })

  it('does not overwrite existing hashes', async () => {
    await executeMigration({ direction: 'up' })
    const collection = db.collection('companies')
    const cursor = await collection.all()
    const companies = orderBy(await cursor.all(), '_key')

    expect(companies[2]).to.have.property('hash', 'EXISTING_HASH')
  })
})
