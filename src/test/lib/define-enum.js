/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { defineEnum } = require('../../gql/lib')

describe('defineEnum', () => {
  it('should throw if no name is given', () => {
    expect(() => defineEnum()).to.throw('defineEnum requires a name')
  })

  it('should throw if no values are given', () => {
    expect(() => defineEnum({ name: 'TestEnum' })).to.throw('defineEnum requires some values')
  })

  it('should return an object', () => {
    expect(defineEnum({
      name: 'TestEnum',
      values: [ 'testValue1', 'testValue2' ]
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(defineEnum({
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
    expect(defineEnum({
      name: 'TestEnum',
      values: [ 'testValue1', 'testValue2' ]
    })).to.have.property('resolvers').to.deep.equal({})
  })

  it('should return the values as a map', () => {
    expect(defineEnum({
      name: 'TestEnum',
      values: [ 'testValue1', 'testValue2' ]
    })).to.have.property('values').to.deep.equal({
      testValue1: 'testValue1',
      testValue2: 'testValue2'
    })
  })
})
