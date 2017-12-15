/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { definePluralByFiltersRelation } = require('../../gql/lib')

describe('definePluralByFiltersRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => definePluralByFiltersRelation()).to.throw('definePluralByFiltersRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    expect(() => definePluralByFiltersRelation({
      parentType: 'Query'
    })).to.throw('definePluralByFiltersRelation requires a type')
  })

  it('should return an object', () => {
    expect(definePluralByFiltersRelation({
      parentType: 'Query',
      type: 'Job'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(definePluralByFiltersRelation({
      parentType: 'Query',
      type: 'Job'
    })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        jobsByFilters(filters: JobFilterInput): [Job!]!
      }
    `)
  })

  it('should return resolver for Query.jobs', () => {
    expect(definePluralByFiltersRelation({
      parentType: 'Query',
      type: 'Job'
    }))
    .to.have.property('resolvers')
    .to.have.property('Query')
    .to.have.property('jobsByFilters')
  })

  describe('the resolver', () => {
    let resolver

    beforeEach(() => {
      resolver = definePluralByFiltersRelation({
        parentType: 'Query',
        type: 'Job'
      }).resolvers.Query.jobsByFilters
    })

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should return the result of a store.readAll call', () => {
      const filters = {
        slug: 'someSlug'
      }
      const fakeStore = {
        readAll: () => 'all_the_jobs'
      }
      const fakeContext = {
        transaction: (action) => {
          return action(fakeStore, {})
        }
      }
      expect(resolver(null, { filters }, fakeContext)).to.equal('all_the_jobs')
    })

    it('should call store.readAll with the collection type', () => {
      const filters = {
        slug: 'someSlug'
      }
      const fakeStore = {
        readAll: ({ type }) => type
      }
      const fakeContext = {
        transaction: (action) => {
          return action(fakeStore, {
            collection: 'jobs'
          })
        }
      }
      expect(resolver(null, { filters }, fakeContext)).to.equal('jobs')
    })

    it('should call store.readAll with the filters passed in args', () => {
      const filters = {
        slug: 'someSlug'
      }
      const fakeStore = {
        readAll: ({ filters }) => filters
      }
      const fakeContext = {
        transaction: (action, params) => {
          return action(fakeStore, params)
        }
      }
      expect(resolver(null, { filters }, fakeContext)).to.deep.equal({
        slug: 'someSlug'
      })
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      expect(definePluralByFiltersRelation({
        parentType: 'Query',
        type: 'Job',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        aDifferentName(filters: JobFilterInput): [Job!]!
      }
    `)
    })
  })

  describe('when the filterType is passed in', () => {
    it('should override the filterType', () => {
      expect(definePluralByFiltersRelation({
        parentType: 'Query',
        type: 'Job',
        filterType: 'aDifferentFilterType'
      })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        jobsByFilters(filters: aDifferentFilterType): [Job!]!
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should override the type passed to store.readAll', () => {
        const filters = {
          slug: 'someSlug'
        }
        const resolver = definePluralByFiltersRelation({
          parentType: 'Query',
          type: 'Job',
          collection: 'aDifferentCollection'
        }).resolvers.Query.jobsByFilters
        const store = {
          readAll: ({ type }) => type
        }
        const fakeContext = {
          transaction: (action, params) => {
            return action(store, params)
          }
        }
        expect(resolver(null, { filters }, fakeContext)).to.deep.equal('aDifferentCollection')
      })
    })
  })

  // Sub entity relations (not root i.e. Query/Mutation)

  describe('when the parent is defined', () => {
    describe('the resolver', () => {
      it('should call store.readOne with filters based on parent.id', () => {
        const filters = {
          slug: 'someSlug'
        }
        const parent = {
          id: 'company1'
        }
        const resolver = definePluralByFiltersRelation({
          parentType: 'Company',
          type: 'Job'
        }).resolvers.Company.jobsByFilters
        const store = {
          readAll: ({ filters }) => filters
        }
        const fakeContext = {
          transaction: (action, params) => {
            return action(store, params)
          }
        }
        expect(resolver(parent, { filters }, fakeContext)).to.deep.equal({
          company: 'company1',
          slug: 'someSlug'
        })
      })
    })

    describe('when parentName is passed in', () => {
      describe('the resolver', () => {
        it('should override key in filters for parent.id', () => {
          const filters = {
            slug: 'someSlug'
          }
          const parent = {
            id: 'company1'
          }
          const resolver = definePluralByFiltersRelation({
            parentType: 'Company',
            parentName: 'aDifferentName',
            type: 'Job'
          }).resolvers.Company.jobsByFilters
          const store = {
            readAll: ({ filters }) => filters
          }
          const fakeContext = {
            transaction: (action, params) => {
              return action(store, params)
            }
          }
          expect(resolver(parent, { filters }, fakeContext)).to.deep.equal({
            aDifferentName: 'company1',
            slug: 'someSlug'
          })
        })
      })
    })
  })
})
