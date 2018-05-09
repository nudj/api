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

const ACTION_STRING_RESPONSE = `function () {
  return 'test'
}`
const COLLECTION_LOCK_RESPONSE = 'collectionLock'
const STORE = () => 'store'
const ACTION = 'action'
const OK = 'OK'
const GOOD_RESPONSE = {
  result: OK
}
const BAD_RESPONSE = {
  exception: 'Some exception message',
  stacktrace: [],
  message: 'Some error message',
  error: true,
  code: 400,
  errorNum: 10,
  errorMessage: 'Some error message'
}
const PARAMS = { param: 'param' }

xdescribe('ArangoAdaptor transaction', () => {
  let server
  let transaction
  let actionToStringStub = sinon.stub().returns(ACTION_STRING_RESPONSE)
  let actionToCollectionLockStub = sinon.stub().returns(COLLECTION_LOCK_RESPONSE)

  before(() => {
    transaction = proxyquire('../../../../gql/adaptors/arango/transaction', {
      './store': STORE,
      './action-to-string': actionToStringStub,
      './action-to-collection-lock': actionToCollectionLockStub
    })
    server = nock(process.env.DB_API_URL)
  })
  afterEach(() => {
    actionToStringStub.reset()
    actionToCollectionLockStub.reset()
    nock.cleanAll()
  })

  describe('when called with good data', () => {
    beforeEach(() => {
      server
        .post('/transaction', {
          collections: {
            write: COLLECTION_LOCK_RESPONSE
          },
          action: `function () { return 'test'; }`,
          params: PARAMS
        })
        .reply(200, GOOD_RESPONSE)
    })

    it('calls actionToCollectionLock with action', () => {
      return transaction(ACTION, PARAMS).then(() => {
        expect(actionToCollectionLockStub).to.have.been.calledWith(ACTION)
      })
    })
    it('calls actionToString with store and action', () => {
      return transaction(ACTION, PARAMS).then(() => {
        expect(actionToStringStub).to.have.been.calledWith(STORE, ACTION)
      })
    })
    it('passes params through and responds with the result of a transaction', () => {
      return expect(transaction(ACTION, PARAMS)).to.eventually.equal(OK)
    })
  })

  describe('when called with bad data', () => {
    beforeEach(() => {
      server
        .post('/transaction', {
          collections: {
            write: COLLECTION_LOCK_RESPONSE
          },
          action: `function () { return 'test'; }`,
          params: PARAMS
        })
        .reply(400, BAD_RESPONSE)
    })

    it('throws with error from Arango', () => {
      return transaction(ACTION, PARAMS).catch(error => {
        expect(error).to.deep.equal(BAD_RESPONSE)
      })
    })
  })
})
