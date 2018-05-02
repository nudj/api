/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const expect = chai.expect

const { setupDependencies, teardownDependencies } = require('../../../helpers/transactions')

describe('ArangoAdaptor StoreTransaction', () => {
  let Store

  before(() => {
    setupDependencies()
    Store = proxyquire('../../../../../gql/adaptors/arango/store-transaction', {
      '@arangodb': {},
      '@arangodb/crypto': {}
    })
  })

  after(() => {
    teardownDependencies()
  })

  it('to be an function', () => {
    expect(Store).to.be.a('function')
  })

  it('should return an object', () => {
    expect(Store()).to.be.an('object')
  })
})
