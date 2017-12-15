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
      parentType: 'Query'
    })).to.throw('definePluralRelation requires a type')
  })

  it('should return an object', () => {
    expect(definePluralRelation({
      parentType: 'Query',
      type: 'Job'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(definePluralRelation({
      parentType: 'Query',
      type: 'Job'
    })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        jobs: [Job!]!
      }
    `)
  })

  it('should return resolver for Query.jobs', () => {
    expect(definePluralRelation({
      parentType: 'Query',
      type: 'Job'
    }))
    .to.have.property('resolvers')
    .to.have.property('Query')
    .to.have.property('jobs')
  })

  describe('the resolver', () => {
    let resolver

    beforeEach(() => {
      resolver = definePluralRelation({
        parentType: 'Query',
        type: 'Job'
      }).resolvers.Query.jobs
    })

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should return the result of a store.readAll call', () => {
      const fakeStore = {
        readAll: () => 'all_the_jobs'
      }
      const fakeContext = {
        transaction: (action) => {
          return action(fakeStore, {})
        }
      }
      expect(resolver(null, null, fakeContext)).to.equal('all_the_jobs')
    })

    it('should call store.readAll with the collection type', () => {
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
      expect(resolver(null, null, fakeContext)).to.equal('jobs')
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      expect(definePluralRelation({
        parentType: 'Query',
        type: 'Job',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        aDifferentName: [Job!]!
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should override the type passed to store.readAll', () => {
        const resolver = definePluralRelation({
          parentType: 'Query',
          type: 'Job',
          collection: 'aDifferentCollection'
        }).resolvers.Query.jobs
        const store = {
          readAll: ({ type }) => type
        }
        const fakeContext = {
          transaction: (action, params) => {
            return action(store, params)
          }
        }
        expect(resolver(null, null, fakeContext)).to.deep.equal('aDifferentCollection')
      })
    })
  })

  // Sub entity relations (not root i.e. Query/Mutation)

  describe('when the parent is defined', () => {
    describe('the resolver', () => {
      it('should call store.readOne with filters based on parent.id', () => {
        const resolver = definePluralRelation({
          parentType: 'Company',
          type: 'Job'
        }).resolvers.Company.jobs
        const parent = {
          id: 'company1'
        }
        const store = {
          readAll: ({ filters }) => filters
        }
        const fakeContext = {
          transaction: (action, params) => {
            return action(store, params)
          }
        }
        expect(resolver(parent, null, fakeContext)).to.deep.equal({
          company: 'company1'
        })
      })
    })

    describe('when parentName is passed in', () => {
      describe('the resolver', () => {
        it('should override key in filters for parent.id', () => {
          const resolver = definePluralRelation({
            parentType: 'Company',
            parentName: 'aDifferentName',
            type: 'Job'
          }).resolvers.Company.jobs
          const parent = {
            id: 'company1'
          }
          const store = {
            readAll: ({ filters }) => filters
          }
          const fakeContext = {
            transaction: (action, params) => {
              return action(store, params)
            }
          }
          expect(resolver(parent, null, fakeContext)).to.deep.equal({
            aDifferentName: 'company1'
          })
        })
      })
    })
  })
})
