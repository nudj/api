/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { rootSingle } = require('../../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('rootSingle', () => {
  it('should throw if no parentType is given', () => {
    return expect(() => rootSingle()).to.throw('rootSingle requires a parentType')
  })

  it('should throw if no type is given', () => {
    return expect(() => rootSingle({
      parentType: 'Parent'
    })).to.throw('rootSingle requires a type')
  })

  it('should return an object', () => {
    return expect(rootSingle({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(rootSingle({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relation(id: ID): Relation
      }
    `)
  })

  it('should return resolver for Parent.relation', () => {
    return expect(rootSingle({
      parentType: 'Parent',
      type: 'Relation'
    }))
    .to.have.property('resolvers')
    .to.have.property('Parent')
    .to.have.property('relation')
  })

  describe('the resolver', () => {
    let resolver

    beforeEach(() => {
      resolver = rootSingle({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relation
    })

    it('should return the result of a store.readOne call', () => {
      const args = {
        id: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: () => Promise.resolve('the_relation')
      })
      return expect(resolver(null, args, fakeContext)).to.eventually.equal('the_relation')
    })

    it('should call store.readOne with the collection type', () => {
      const args = {
        id: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      return expect(resolver(null, args, fakeContext)).to.eventually.have.deep.property('type', 'relations')
    })

    it('should call store.readOne with the id', () => {
      const args = {
        id: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      return expect(resolver(null, args, fakeContext)).to.eventually.have.deep.property('id', 'relation1')
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      return expect(rootSingle({
        parentType: 'Parent',
        type: 'Relation',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        aDifferentName(id: ID): Relation
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should override the type passed to store.readOne', () => {
        const resolver = rootSingle({
          parentType: 'Parent',
          type: 'Relation',
          collection: 'aDifferentCollection'
        }).resolvers.Parent.relation
        const args = {
          id: 'relation1'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => Promise.resolve(args)
        })
        return expect(resolver(null, args, fakeContext)).to.eventually.have.property('type', 'aDifferentCollection')
      })
    })
  })

  describe('when no id is given during query execution', () => {
    describe('the resolver', () => {
      it('should return null', () => {
        const resolver = rootSingle({
          parentType: 'Parent',
          type: 'Relation'
        }).resolvers.Parent.relation
        const args = {}
        return expect(resolver(null, args)).to.eventually.be.null
      })
    })
  })
})
