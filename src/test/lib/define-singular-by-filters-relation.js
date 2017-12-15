/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { defineSingularByFiltersRelation } = require('../../gql/lib')

const fakeContextEchosReadOneArgs = {
  transaction: (action, params) => {
    return action({
      readOne: args => args
    }, params)
  }
}

describe('defineSingularByFiltersRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => defineSingularByFiltersRelation()).to.throw('defineSingularByFiltersRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    expect(() => defineSingularByFiltersRelation({
      parentType: 'Query'
    })).to.throw('defineSingularByFiltersRelation requires a type')
  })

  it('should return an object', () => {
    expect(defineSingularByFiltersRelation({
      parentType: 'Query',
      type: 'Job'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(defineSingularByFiltersRelation({
      parentType: 'Query',
      type: 'Job'
    })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        jobByFilters(filters: JobFilterInput!): Job!
      }
    `)
  })

  it('should return resolver for Query.jobByFilters', () => {
    expect(defineSingularByFiltersRelation({
      parentType: 'Query',
      type: 'Job'
    }))
    .to.have.property('resolvers')
    .to.have.property('Query')
    .to.have.property('jobByFilters')
  })

  describe('the resolver', () => {
    let resolver

    beforeEach(() => {
      resolver = defineSingularByFiltersRelation({
        parentType: 'Query',
        type: 'Job'
      }).resolvers.Query.jobByFilters
    })

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should return the result of a store.readOne call', () => {
      const filters = {
        slug: 'someSlug'
      }
      const fakeStore = {
        readOne: () => 'the_job'
      }
      const fakeContext = {
        transaction: (action) => {
          return action(fakeStore, {})
        }
      }
      expect(resolver(null, { filters }, fakeContext)).to.equal('the_job')
    })

    it('should call store.readOne with the collection type', () => {
      const filters = {
        slug: 'someSlug'
      }
      expect(resolver(null, { filters }, fakeContextEchosReadOneArgs).type).to.equal('jobs')
    })

    it('should call store.readOne with the filters passed in args', () => {
      const filters = {
        slug: 'someSlug'
      }
      expect(resolver(null, { filters }, fakeContextEchosReadOneArgs).filters).to.deep.equal({
        slug: 'someSlug'
      })
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      expect(defineSingularByFiltersRelation({
        parentType: 'Query',
        type: 'Job',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        aDifferentName(filters: JobFilterInput!): Job!
      }
    `)
    })
  })

  describe('when the filterType is passed in', () => {
    it('should override the filterType', () => {
      expect(defineSingularByFiltersRelation({
        parentType: 'Query',
        type: 'Job',
        filterType: 'aDifferentFilterType'
      })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        jobByFilters(filters: aDifferentFilterType!): Job!
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should override the type passed to store.readOne', () => {
        const resolver = defineSingularByFiltersRelation({
          parentType: 'Query',
          type: 'Job',
          collection: 'aDifferentCollection'
        }).resolvers.Query.jobByFilters
        const filters = {
          slug: 'someSlug'
        }
        expect(resolver(null, { filters }, fakeContextEchosReadOneArgs).type).to.deep.equal('aDifferentCollection')
      })
    })
  })

  // Sub entity relations (not root i.e. Query/Mutation)

  describe('when the parent is defined', () => {
    describe('the resolver', () => {
      it('should call store.readOne with filters based on parent.id', () => {
        const resolver = defineSingularByFiltersRelation({
          parentType: 'Company',
          type: 'Job'
        }).resolvers.Company.jobByFilters
        const parent = {
          id: 'company1'
        }
        const filters = {
          slug: 'someSlug'
        }
        expect(resolver(parent, { filters }, fakeContextEchosReadOneArgs).filters).to.deep.equal({
          company: 'company1',
          slug: 'someSlug'
        })
      })
    })

    describe('when parentName is passed in', () => {
      describe('the resolver', () => {
        it('should override key in filters for parent.id', () => {
          const resolver = defineSingularByFiltersRelation({
            parentType: 'Company',
            parentName: 'aDifferentName',
            type: 'Job'
          }).resolvers.Company.jobByFilters
          const parent = {
            id: 'company1'
          }
          const filters = {
            slug: 'someSlug'
          }
          expect(resolver(parent, { filters }, fakeContextEchosReadOneArgs).filters).to.deep.equal({
            aDifferentName: 'company1',
            slug: 'someSlug'
          })
        })
      })
    })
  })
})
