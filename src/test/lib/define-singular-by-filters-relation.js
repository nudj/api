/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { defineSingularByFiltersRelation } = require('../../gql/lib')

describe('defineSingularByFiltersRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => defineSingularByFiltersRelation()).to.throw('defineSingularByFiltersRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    expect(() => defineSingularByFiltersRelation({
      parentType: 'Query',
      name: 'jobByFilters',
      collection: 'jobs',
      filterType: 'JobFilterInput'
    })).to.throw('defineSingularByFiltersRelation requires a type')
  })

  describe('when all arguments are provided', () => {
    it('should return an object', () => {
      expect(defineSingularByFiltersRelation({
        parentType: 'Query',
        name: 'jobByFilters',
        type: 'Job',
        collection: 'jobs',
        filterType: 'JobFilterInput'
      })).to.be.an('object')
    })

    it('should return the typeDefs', () => {
      expect(defineSingularByFiltersRelation({
        parentType: 'Query',
        name: 'jobByFilters',
        type: 'Job',
        collection: 'jobs',
        filterType: 'JobFilterInput'
      })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        jobByFilters(filters: JobFilterInput!): Job
      }
    `)
    })

    it('should return resolver patch for Query.singular', () => {
      expect(defineSingularByFiltersRelation({
        parentType: 'Query',
        name: 'jobByFilters',
        type: 'Job',
        collection: 'jobs',
        filterType: 'JobFilterInput'
      }))
      .to.have.property('resolvers')
      .to.have.property('Query')
      .to.have.property('jobByFilters')
    })

    describe('the resolver', () => {
      const resolver = defineSingularByFiltersRelation({
        parentType: 'Query',
        name: 'jobByFilters',
        type: 'Job',
        collection: 'jobs',
        filterType: 'JobFilterInput'
      }).resolvers.Query.jobByFilters

      it('should be a function', () => {
        expect(resolver).to.be.a('function')
      })

      it('should pass the queryArgs through to the transaction', () => {
        const filters = {
          id: 'jobId'
        }
        const queryArgs = { filters }
        const fakeContext = {
          transaction: (action, transactionParams) => transactionParams
        }
        expect(resolver(null, queryArgs, fakeContext)).to.deep.equal({ filters })
      })

      it('should call store.readOne with the collection type and filters', () => {
        const type = 'jobs'
        const filters = {
          id: 'jobId'
        }
        const queryArgs = { filters }
        const transactionParams = { filters }
        const store = {
          readOne: ({ type, filters }) => ({ type, filters })
        }
        const fakeContext = {
          transaction: (action) => {
            return action(store, transactionParams)
          }
        }
        expect(resolver(null, queryArgs, fakeContext)).to.deep.equal({ type, filters })
      })

      it('should return the result of the store.readOne call', () => {
        const filters = {
          id: 'jobId'
        }
        const queryArgs = { filters }
        const transactionParams = { filters }
        const store = {
          readOne: () => 'the_job'
        }
        const fakeContext = {
          transaction: (action) => {
            return action(store, transactionParams)
          }
        }
        expect(resolver(null, queryArgs, fakeContext)).to.equal('the_job')
      })
    })
  })

  describe('when the name is missing', () => {
    let result

    beforeEach(() => {
      result = defineSingularByFiltersRelation({
        parentType: 'Query',
        type: 'SomeLongObscureType',
        collection: 'jobs',
        filterType: 'JobFilterInput'
      })
    })

    it('should generate a name based on the type', () => {
      expect(result)
      .to.have.property('typeDefs')
      .to.equal(`
      extend type Query {
        someLongObscureTypeByFilters(filters: JobFilterInput!): SomeLongObscureType
      }
    `)
    })

    it('should return resolver patch for Query.singular', () => {
      expect(result)
      .to.have.property('resolvers')
      .to.have.property('Query')
      .to.have.property('someLongObscureTypeByFilters')
    })

    it('the resolver should be a function', () => {
      expect(result.resolvers.Query.someLongObscureTypeByFilters).to.be.a('function')
    })
  })

  describe('when the collection is missing the resolver', () => {
    it('should call store.readOne with a collection that is a pluralisation of the type', () => {
      const resolver = defineSingularByFiltersRelation({
        parentType: 'Query',
        type: 'SomeLongObscureType',
        name: 'jobByFilters',
        filterType: 'JobFilterInput'
      }).resolvers.Query.jobByFilters
      const type = 'someLongObscureTypes'
      const filters = {
        id: 'jobId'
      }
      const queryArgs = { filters }
      const transactionParams = { filters }
      const store = {
        readOne: ({ type, filters }) => ({ type, filters })
      }
      const fakeContext = {
        transaction: (action) => {
          return action(store, transactionParams)
        }
      }
      expect(resolver(null, queryArgs, fakeContext)).to.deep.equal({ type, filters })
    })
  })

  describe('when the filterType is missing', () => {
    it('should generate a filterType based on the type', () => {
      expect(defineSingularByFiltersRelation({
        parentType: 'Query',
        type: 'SomeLongObscureType',
        name: 'jobByFilters',
        collection: 'jobs'
      })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        jobByFilters(filters: SomeLongObscureTypeFilterInput!): SomeLongObscureType
      }
    `)
    })
  })
})
