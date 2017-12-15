/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { defineSingularRelation } = require('../../gql/lib')

const fakeContextEchosReadOneArgs = {
  transaction: (action, params) => {
    return action({
      readOne: args => args
    }, params)
  }
}

describe('defineSingularRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => defineSingularRelation()).to.throw('defineSingularRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    expect(() => defineSingularRelation({
      parentType: 'Query'
    })).to.throw('defineSingularRelation requires a type')
  })

  it('should return an object', () => {
    expect(defineSingularRelation({
      parentType: 'Query',
      type: 'Job'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(defineSingularRelation({
      parentType: 'Query',
      type: 'Job'
    })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        job(id: ID!): Job!
      }
    `)
  })

  it('should return resolver for Query.job', () => {
    expect(defineSingularRelation({
      parentType: 'Query',
      type: 'Job'
    }))
    .to.have.property('resolvers')
    .to.have.property('Query')
    .to.have.property('job')
  })

  describe('the resolver', () => {
    let resolver

    beforeEach(() => {
      resolver = defineSingularRelation({
        parentType: 'Query',
        type: 'Job'
      }).resolvers.Query.job
    })

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should return the result of a store.readOne call', () => {
      const args = {
        id: 'job1'
      }
      const fakeStore = {
        readOne: () => 'the_job'
      }
      const fakeContext = {
        transaction: (action, params) => {
          return action(fakeStore, params)
        }
      }
      expect(resolver(null, args, fakeContext)).to.equal('the_job')
    })

    it('should call store.readOne with the collection type', () => {
      const args = {
        id: 'job1'
      }
      expect(resolver(null, args, fakeContextEchosReadOneArgs).type).to.equal('jobs')
    })

    it('should call store.readOne with the id', () => {
      const args = {
        id: 'job1'
      }
      expect(resolver(null, args, fakeContextEchosReadOneArgs).id).to.equal('job1')
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      expect(defineSingularRelation({
        parentType: 'Query',
        type: 'Job',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        aDifferentName(id: ID!): Job!
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should override the type passed to store.readOne', () => {
        const resolver = defineSingularRelation({
          parentType: 'Company',
          type: 'Job',
          collection: 'aDifferentCollection'
        }).resolvers.Company.job
        const args = {
          id: 'job1'
        }
        expect(resolver(null, args, fakeContextEchosReadOneArgs).type).to.deep.equal('aDifferentCollection')
      })
    })
  })

  // Sub entity relations (not root i.e. Query/Mutation)

  describe('when the parent is defined', () => {
    describe('the resolver', () => {
      it('should not call store.readOne with id', () => {
        const resolver = defineSingularRelation({
          parentType: 'Company',
          type: 'Job'
        }).resolvers.Company.job
        const parent = {
          id: 'company1'
        }
        const args = {
          id: 'job1'
        }
        expect(resolver(parent, args, fakeContextEchosReadOneArgs).id).to.be.undefined()
      })

      it('should call store.readOne with filters based on parent.id', () => {
        const resolver = defineSingularRelation({
          parentType: 'Company',
          type: 'Job'
        }).resolvers.Company.job
        const parent = {
          id: 'company1'
        }
        const args = {
          id: 'job1'
        }
        expect(resolver(parent, args, fakeContextEchosReadOneArgs).filters).to.deep.equal({
          id: 'job1',
          company: 'company1'
        })
      })
    })

    describe('when parentName is passed in', () => {
      describe('the resolver', () => {
        it('should override key in filters for parent.id', () => {
          const resolver = defineSingularRelation({
            parentType: 'Company',
            parentName: 'aDifferentParentName',
            type: 'Job'
          }).resolvers.Company.job
          const parent = {
            id: 'company1'
          }
          const args = {
            id: 'job1'
          }
          expect(resolver(parent, args, fakeContextEchosReadOneArgs).filters).to.deep.equal({
            id: 'job1',
            aDifferentParentName: 'company1'
          })
        })
      })
    })
  })
})
