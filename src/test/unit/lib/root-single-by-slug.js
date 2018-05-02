/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { rootSingleBySlug } = require('../../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')
const {
  TABLES,
  INDICES
} = require('../../../lib/sql')

describe('rootSingleBySlug', () => {
  it('should throw if no parentType is given', () => {
    return expect(() => rootSingleBySlug()).to.throw('rootSingleBySlug requires a parentType')
  })

  it('should throw if no type is given', () => {
    return expect(() => rootSingleBySlug({
      parentType: 'Query'
    })).to.throw('rootSingleBySlug requires a type')
  })

  it('should return an object', () => {
    return expect(rootSingleBySlug({
      parentType: 'Query',
      type: 'Referral'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(rootSingleBySlug({
      parentType: 'Query',
      type: 'Referral'
    })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        referralBySlug(slug: String): Referral
      }
    `)
  })

  it('should return resolver for Query.referral', () => {
    return expect(rootSingleBySlug({
      parentType: 'Query',
      type: 'Referral'
    }))
    .to.have.property('resolvers')
    .to.have.property('Query')
    .to.have.property('referralBySlug')
  })

  describe('the resolver', () => {
    let resolver

    beforeEach(() => {
      resolver = rootSingleBySlug({
        parentType: 'Query',
        type: 'Referral'
      }).resolvers.Query.referralBySlug
    })

    it('should return the result of a store.readOne call', () => {
      const args = {
        slug: 'referral1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: () => Promise.resolve('the_referral')
      })
      return expect(resolver(null, args, fakeContext)).to.eventually.equal('the_referral')
    })

    it('should call store.readOne with the collection type', async () => {
      const args = {
        slug: 'referral1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      const result = await resolver(null, args, fakeContext)
      expect(result).to.have.deep.property('type', 'referrals')
    })

    it('should call store.readOne with the slug index', async () => {
      const args = {
        slug: 'referral1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      const result = await resolver(null, args, fakeContext)
      expect(result).to.have.deep.property('index', INDICES[TABLES.REFERRALS].slug)
    })

    it('should call store.readOne with the key', async () => {
      const args = {
        slug: 'referral1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      const result = await resolver(null, args, fakeContext)
      expect(result).to.have.deep.property('key', 'referral1')
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      return expect(rootSingleBySlug({
        parentType: 'Query',
        type: 'Referral',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        aDifferentName(slug: String): Referral
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should pass the overridden type to store.readOne', () => {
        const resolver = rootSingleBySlug({
          parentType: 'Query',
          type: 'Company',
          collection: 'companies'
        }).resolvers.Query.companyBySlug
        const args = {
          slug: 'referral1'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => Promise.resolve(args)
        })
        return expect(resolver(null, args, fakeContext)).to.eventually.have.property('type', 'companies')
      })
    })
  })

  describe('when no id is given during query execution', () => {
    describe('the resolver', () => {
      it('should return null', () => {
        const resolver = rootSingleBySlug({
          parentType: 'Query',
          type: 'Referral'
        }).resolvers.Query.referralBySlug
        const args = {}
        return expect(resolver(null, args)).to.eventually.be.null
      })
    })
  })
})
