/* eslint-env mocha */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const dirtyChai = require('dirty-chai')
const nock = require('nock')
const proxyquire = require('proxyquire')
const expect = chai.expect

chai.use(chaiAsPromised)
chai.use(sinonChai)
chai.use(dirtyChai)

nock.emitter.on('no match', function (req) {
  console.log('No match for request:', req)
})

const ACTION_STRING_RESPONSE = `function () {
  return 'test'
}`
const COLLECTION_LOCK_RESPONSE = 'collectionLock'

describe('ArangoAdaptor Transaction', () => {
  let server
  let Transaction
  let actionToStringStub = sinon.stub().returns(ACTION_STRING_RESPONSE)
  let actionToCollectionLockStub = sinon.stub().returns(COLLECTION_LOCK_RESPONSE)

  before(() => {
    Transaction = proxyquire('../../gql/arango-adaptor/transaction', {
      './action-to-string': actionToStringStub,
      './action-to-collection-lock': actionToCollectionLockStub
    })
    server = nock('http://localhost:82/_api')
  })
  afterEach(() => {
    actionToStringStub.reset()
    actionToCollectionLockStub.reset()
    nock.cleanAll()
  })

  it('during setup returns a function', () => {
    expect(Transaction()).to.be.a('function')
  })

  describe('when called with good data', () => {
    let transaction
    const STORE = 'store'
    const ACTION = 'action'
    const RESPONSE = 'OK'

    beforeEach(() => {
      server
        .post('/transaction', {
          collections: {
            write: COLLECTION_LOCK_RESPONSE
          },
          action: `function () { return 'test'; }`
        })
        .reply(200, RESPONSE)
      transaction = Transaction(STORE)
    })

    it('calls actionToCollectionLock with action', () => {
      return transaction(ACTION).then(() => {
        expect(actionToCollectionLockStub).to.have.been.calledWith(ACTION)
      })
    })
    it('calls actionToString with store and action', () => {
      return transaction(ACTION).then(() => {
        expect(actionToStringStub).to.have.been.calledWith(STORE, ACTION)
      })
    })
    it('responds with the result of a transaction', () => {
      return expect(transaction(ACTION)).to.eventually.equal(RESPONSE)
    })
  })
})
