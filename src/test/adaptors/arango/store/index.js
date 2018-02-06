/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const Store = require('../../../../gql/adaptors/arango/store')

describe('ArangoAdaptor Store', () => {
  it('to be an function', () => {
    expect(Store).to.be.a('function')
  })

  it('should return an object', () => {
    expect(Store({})).to.be.an('object')
  })
})
