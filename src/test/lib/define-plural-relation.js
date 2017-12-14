/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { definePluralRelation } = require('../../gql/lib')

describe('definePluralRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => definePluralRelation()).to.throw('definePluralRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    expect(() => definePluralRelation({
      parentType: 'Query',
      name: 'jobs'
    })).to.throw('definePluralRelation requires a type')
  })

  it('should return an object', () => {
    expect(definePluralRelation({
      parentType: 'Query',
      name: 'jobs',
      type: 'Job',
      collection: 'jobs'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(definePluralRelation({
      parentType: 'Query',
      name: 'jobs',
      type: 'Job',
      collection: 'jobs'
    })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        jobs: [Job!]!
      }
    `)
  })

  it('should return resolver patch for Query.jobs', () => {
    expect(definePluralRelation({
      parentType: 'Query',
      name: 'jobs',
      type: 'Job',
      collection: 'jobs'
    }))
    .to.have.property('resolvers')
    .to.have.property('Query')
    .to.have.property('jobs')
  })

  describe('the resolver', () => {
    const resolver = definePluralRelation({
      parentType: 'Query',
      name: 'jobs',
      type: 'Job',
      collection: 'jobs'
    }).resolvers.Query.jobs

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should return the result of a store.readAll call', () => {
      const fakeContext = {
        transaction: (action) => {
          return action({
            readAll: () => 'all_the_jobs'
          }, {})
        }
      }
      expect(resolver(null, null, fakeContext)).to.equal('all_the_jobs')
    })

    it('should store.readAll with the collection type', () => {
      const fakeContext = {
        transaction: (action) => {
          return action({
            readAll: ({ type }) => type
          }, {
            collection: 'jobs'
          })
        }
      }
      expect(resolver(null, null, fakeContext)).to.equal('jobs')
    })
  })

  describe('when the name is missing', () => {
    it('should generate a name based on the type', () => {
      expect(definePluralRelation({
        parentType: 'Query',
        type: 'SomeLongObscureType',
        collection: 'jobs'
      })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        someLongObscureTypes: [SomeLongObscureType!]!
      }
    `)
    })
  })

  describe('when the collection is missing the resolver', () => {
    it('should call store.readOne with a collection that is a pluralisation of the type', () => {
      const resolver = definePluralRelation({
        parentType: 'Query',
        name: 'job',
        type: 'SomeLongObscureType'
      }).resolvers.Query.job
      const type = 'someLongObscureTypes'
      const id = 'jobId'
      const args = { id }
      const store = {
        readAll: ({ type }) => type
      }
      const fakeContext = {
        transaction: (action, params) => {
          return action(store, params)
        }
      }
      expect(resolver(null, args, fakeContext)).to.deep.equal(type)
    })
  })
})
