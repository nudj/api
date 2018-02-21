/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { rootEnum } = require('../../../gql/lib')

describe('rootEnum', () => {
  it('should throw if no name is given', () => {
    expect(() => rootEnum()).to.throw('rootEnum requires a name')
  })

  it('should throw if no values are given', () => {
    expect(() => rootEnum({ name: 'TestEnum' })).to.throw('rootEnum requires some values')
  })

  it('should return an object', () => {
    expect(rootEnum({
      name: 'TestEnum',
      values: [ 'testValue1', 'testValue2' ]
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(rootEnum({
      name: 'TestEnum',
      values: [ 'testValue1', 'testValue2' ]
    })).to.have.property('typeDefs').to.equal(`
      enum TestEnum {
        testValue1
        testValue2
      }
    `)
  })

  it('should return no resolvers', () => {
    expect(rootEnum({
      name: 'TestEnum',
      values: [ 'testValue1', 'testValue2' ]
    })).to.have.property('resolvers').to.deep.equal({})
  })

  it('should return the values as a map', () => {
    expect(rootEnum({
      name: 'TestEnum',
      values: [ 'testValue1', 'testValue2' ]
    })).to.have.property('values').to.deep.equal({
      testValue1: 'testValue1',
      testValue2: 'testValue2'
    })
  })
})
