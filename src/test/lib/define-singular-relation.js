/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { defineSingularRelation } = require('../../gql/lib')

describe('defineSingularRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => defineSingularRelation()).to.throw('defineSingularRelation requires a parentType')
  })

  it('should throw if no name is given', () => {
    expect(() => defineSingularRelation({
      parentType: 'Query'
    })).to.throw('defineSingularRelation requires a name')
  })

  it('should throw if no type is given', () => {
    expect(() => defineSingularRelation({
      parentType: 'Query',
      name: 'job'
    })).to.throw('defineSingularRelation requires a type')
  })

  it('should throw if no collection is given', () => {
    expect(() => defineSingularRelation({
      parentType: 'Query',
      name: 'job',
      type: 'Job'
    })).to.throw('defineSingularRelation requires a collection')
  })

  it('should return an object', () => {
    expect(defineSingularRelation({
      parentType: 'Query',
      name: 'job',
      type: 'Job',
      collection: 'jobs'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(defineSingularRelation({
      parentType: 'Query',
      name: 'job',
      type: 'Job',
      collection: 'jobs'
    })).to.have.property('typeDefs').to.equal(`
      extend type Query {
        job(id: ID!): Job!
      }
    `)
  })

  it('should return resolver patch for Query.jobs', () => {
    expect(defineSingularRelation({
      parentType: 'Query',
      name: 'job',
      type: 'Job',
      collection: 'jobs'
    }))
    .to.have.property('resolvers')
    .to.have.property('Query')
    .to.have.property('job')
  })

  describe('the resolver', () => {
    const resolver = defineSingularRelation({
      parentType: 'Query',
      name: 'job',
      type: 'Job',
      collection: 'jobs'
    }).resolvers.Query.job

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should pass the args through to the transaction', () => {
      const id = 'jobId'
      const args = { id }
      const fakeContext = {
        transaction: (action, params) => params
      }
      expect(resolver(null, args, fakeContext)).to.deep.equal({ id })
    })

    it('should call store.readAll with the collection type and item id', () => {
      const type = 'jobs'
      const id = 'jobId'
      const args = { id }
      const params = { id }
      const store = {
        readOne: ({ type, id }) => ({ type, id })
      }
      const fakeContext = {
        transaction: (action) => {
          return action(store, params)
        }
      }
      expect(resolver(null, args, fakeContext)).to.deep.equal({ type, id })
    })

    it('should return the result of the store.readOne call', () => {
      const id = 'jobId'
      const args = { id }
      const params = { id }
      const store = {
        readOne: () => 'the_job'
      }
      const fakeContext = {
        transaction: (action) => {
          return action(store, params)
        }
      }
      expect(resolver(null, args, fakeContext)).to.equal('the_job')
    })
  })
})
