/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { definePluralByFiltersRelation } = require('../../gql/lib')

describe('definePluralByFiltersRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => definePluralByFiltersRelation()).to.throw('definePluralByFiltersRelation requires a parentType')
  })

  it('should throw if no name is given', () => {
    expect(() => definePluralByFiltersRelation({
      parentType: 'Query'
    })).to.throw('definePluralByFiltersRelation requires a name')
  })

  it('should throw if no type is given', () => {
    expect(() => definePluralByFiltersRelation({
      parentType: 'Query',
      name: 'jobsByFilters'
    })).to.throw('definePluralByFiltersRelation requires a type')
  })

  it('should throw if no collection is given', () => {
    expect(() => definePluralByFiltersRelation({
      parentType: 'Query',
      name: 'jobsByFilters',
      type: 'Job'
    })).to.throw('definePluralByFiltersRelation requires a collection')
  })

  it('should throw if no filterType is given', () => {
    expect(() => definePluralByFiltersRelation({
      parentType: 'Query',
      name: 'jobsByFilters',
      type: 'Job',
      collection: 'jobs'
    })).to.throw('definePluralByFiltersRelation requires a filterType')
  })

  it('should return an object', () => {
    expect(definePluralByFiltersRelation({
      parentType: 'Query',
      name: 'jobsByFilters',
      type: 'Job',
      collection: 'jobs',
      filterType: 'JobFilterInput'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(definePluralByFiltersRelation({
      parentType: 'Query',
      name: 'jobsByFilters',
      type: 'Job',
      collection: 'jobs',
      filterType: 'JobFilterInput'
    })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        jobsByFilters(filters: JobFilterInput): [Job!]!
      }
    `)
  })

  it('should return resolver patch for Query.pluralByFilters', () => {
    expect(definePluralByFiltersRelation({
      parentType: 'Query',
      name: 'jobsByFilters',
      type: 'Job',
      collection: 'jobs',
      filterType: 'JobFilterInput'
    }))
    .to.have.property('resolvers')
    .to.have.property('Query')
    .to.have.property('jobsByFilters')
  })

  describe('the resolver', () => {
    const resolver = definePluralByFiltersRelation({
      parentType: 'Query',
      name: 'jobsByFilters',
      type: 'Job',
      collection: 'jobs',
      filterType: 'JobFilterInput'
    }).resolvers.Query.jobsByFilters

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should pass the args through to the transaction', () => {
      const filters = { name: 'abc' }
      const args = { filters }
      const fakeContext = {
        transaction: (action, params) => params
      }
      expect(resolver(null, args, fakeContext)).to.deep.equal(args)
    })

    it('should call store.readAll with the collection type and item id', () => {
      const type = 'jobs'
      const filters = { name: 'abc' }
      const args = { filters }
      const params = { filters }
      const store = {
        readAll: ({ type, filters }) => ({ type, filters })
      }
      const fakeContext = {
        transaction: (action) => {
          return action(store, params)
        }
      }
      expect(resolver(null, args, fakeContext)).to.deep.equal({ type, filters })
    })

    it('should return the result of the store.readAll call', () => {
      const id = 'jobId'
      const args = { id }
      const params = { id }
      const store = {
        readAll: () => 'the_filtered_jobs'
      }
      const fakeContext = {
        transaction: (action) => {
          return action(store, params)
        }
      }
      expect(resolver(null, args, fakeContext)).to.equal('the_filtered_jobs')
    })
  })
})
