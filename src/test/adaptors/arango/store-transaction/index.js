/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const expect = chai.expect

describe('ArangoAdaptor Store', () => {
  let Store

  before(() => {
    Store = proxyquire('../../../../gql/adaptors/arango/store-transaction', {
      '@arangodb': {}
    })
  })

  it('to be an function', () => {
    expect(Store).to.be.a('function')
  })

  it('should return an object', () => {
    expect(Store()).to.be.an('object')
  })
})
