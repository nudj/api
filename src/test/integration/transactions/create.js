/* eslint-env mocha */
const isValid = require('date-fns/is_valid')
const orderBy = require('lodash/orderBy')
const randomWords = require('random-words')
const {
  db,
  setupCollections,
  teardownCollections,
  truncateCollections,
  populateCollections,
  expect
} = require('../lib')

const Store = require('../../../gql/adaptors/arango/store')
const context = require('../../../gql/adaptors/arango')

const resetDataStore = async () => populateCollections(db, [
  {
    name: 'people',
    data: [
      {
        email: 'test@email.tld'
      }
    ]
  }
])

xdescribe('Transactions create', () => {
  let store
  before(async () => {
    await setupCollections(db, ['people'])
  })

  beforeEach(async () => {
    await resetDataStore()
    store = Store({ db })
  })

  after(async () => {
    await teardownCollections(db, ['people'])
  })

  afterEach(async () => {
    await truncateCollections(db, ['people'])
  })

  it('adds a new entry to the collection', async () => {
    await context.transaction((store, params) => {
      return store.create({
        type: 'people',
        data: {
          email: 'transaction@email.tld'
        }
      })
    }, {})
    const updatedFruitsCollection = await db.collection('people').all()
    const results = orderBy(await updatedFruitsCollection.all(), ['email'])
    expect(results.length).to.equal(2)
    expect(results[1]).to.have.property('_key').to.be.a('string')
    expect(results[1]).to.have.property('email').to.equal('transaction@email.tld')
  })

  it('returns normalised version of new item', async () => {
    const result = await context.transaction((store, params) => {
      return store.create({
        type: 'people',
        data: {
          email: 'transaction@email.tld'
        }
      })
    }, {})
    expect(result).to.have.property('email').to.equal('transaction@email.tld')
  })

  it('adds a created and modified date', async () => {
    const result = await context.transaction((store, params) => {
      return store.create({
        type: 'people',
        data: {
          email: 'transaction@email.tld'
        }
      })
    }, {})
    const isValidDate = (timestamp) => isValid(new Date(timestamp))
    expect(result.created).to.exist()
    expect(result.modified).to.exist()
    expect(isValidDate(result.created)).to.be.true()
    expect(isValidDate(result.modified)).to.be.true()
  })

  it('generates an id based composite key', async () => {
    const duplicationError = 'cannot create document, unique constraint violated'
    await context.transaction((store, params) => {
      return store.create({
        type: 'people',
        data: {
          email: 'conflict@email.tld'
        }
      })
    }, {})

    expect(store.create({
      type: 'people',
      data: {
        email: 'conflict@email.tld'
      }
    })).to.eventually.be.rejectedWith(duplicationError)
  })

  it('generates ids identical to `store.create`', async () => {
    const duplicationError = 'cannot create document, unique constraint violated'
    const randomEmails = Array.apply(null, Array(100)).map(entry => {
      return `${randomWords({ exactly: 2, join: '.' })}@email.tld`
    })

    await Promise.all(randomEmails.map(async (email) => {
      await context.transaction((store, params) => {
        return store.create({
          type: 'people',
          data: { email: params.email }
        })
      }, { email })

      return expect(store.create({
        type: 'people',
        data: { email }
      })).to.eventually.be.rejectedWith(duplicationError)
    }))
  }).timeout(5000)
})
