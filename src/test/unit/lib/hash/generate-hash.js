/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { generateHash } = require('../../../../gql/lib/hash')

describe('generateHash', () => {
  describe('with input', () => {
    it('creates the same hash for the given input', () => {
      expect(generateHash('cats')).to.equal(generateHash('cats'))
      expect(generateHash('cats')).to.not.equal(generateHash('dogs'))
    })
  })

  describe('without input', () => {
    it('creates a random hash', () => {
      const hash = generateHash()
      expect(hash).to.exist()
      expect(hash).to.be.a('string')
      expect(hash).to.not.equal(generateHash())
    })
  })
})
