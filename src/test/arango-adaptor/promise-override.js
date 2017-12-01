/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const PromiseOverride = require('../../gql/arango-adaptor/promise-override')

describe('ArangoAdaptor PromiseOverride', () => {
  it('to be a function', () => {
    expect(PromiseOverride).to.be.a('function')
  })

  it('should initialise to a function', () => {
    expect(PromiseOverride()).to.be.a('function')
  })

  it('should pass resolve to cb which sets internal result value', () => {
    const P = PromiseOverride()
    const p = new P(resolve => resolve(123))
    expect(p.result).to.equal(123)
  })

  it('should return a thenable', () => {
    const P = PromiseOverride()
    const p = new P(resolve => resolve(123))
    expect(p.then).to.exist()
  })

  it('should resolved value onto any then function', () => {
    const P = PromiseOverride()
    const p = new P(resolve => resolve(123))
    p.then(result => expect(result).to.equal(123))
  })

  describe('Promise.resolve class method', () => {
    it('should return a thenable', () => {
      const P = PromiseOverride()
      expect(P.resolve(123).then).to.exist()
    })

    it('should resolve with the passed value', () => {
      const P = PromiseOverride()
      P.resolve(123).then(result => expect(result).to.equal(123))
    })
  })

  describe('Promise.all class method', () => {
    it('should return a thenable', () => {
      const P = PromiseOverride()
      expect(P.all([123, 456]).then).to.exist()
    })

    it('should resolve with the passed value', () => {
      const P = PromiseOverride()
      P.all([123, 456]).then(result => expect(result).to.deep.equal([123, 456]))
    })
  })
})
