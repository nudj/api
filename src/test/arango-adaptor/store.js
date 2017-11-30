/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const expect = chai.expect

describe('ArangoAdaptor Store', () => {
  let Store

  before(() => {
    Store = proxyquire('../../gql/arango-adaptor/store', {
      '@arangodb': {}
    })
  })

  it('to be an object', () => {
    expect(Store).to.be.an('object')
  })
})
