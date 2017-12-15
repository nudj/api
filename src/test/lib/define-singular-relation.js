/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { defineSingularRelation } = require('../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('defineSingularRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => defineSingularRelation()).to.throw('defineSingularRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    expect(() => defineSingularRelation({
      parentType: 'Parent'
    })).to.throw('defineSingularRelation requires a type')
  })

  it('should return an object', () => {
    expect(defineSingularRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(defineSingularRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relation(id: ID!): Relation!
      }
    `)
  })

  it('should return resolver for Parent.relation', () => {
    expect(defineSingularRelation({
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
      resolver = defineSingularRelation({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relation
    })

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should return the result of a store.readOne call', () => {
      const args = {
        id: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: () => 'the_relation'
      })
      expect(resolver(null, args, fakeContext)).to.equal('the_relation')
    })

    it('should call store.readOne with the collection type', () => {
      const args = {
        id: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => args
      })
      expect(resolver(null, args, fakeContext).type).to.equal('relations')
    })

    it('should call store.readOne with the id', () => {
      const args = {
        id: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => args
      })
      expect(resolver(null, args, fakeContext).id).to.equal('relation1')
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      expect(defineSingularRelation({
        parentType: 'Parent',
        type: 'Relation',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        aDifferentName(id: ID!): Relation!
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should override the type passed to store.readOne', () => {
        const resolver = defineSingularRelation({
          parentType: 'Parent',
          type: 'Relation',
          collection: 'aDifferentCollection'
        }).resolvers.Parent.relation
        const args = {
          id: 'relation1'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => args
        })
        expect(resolver(null, args, fakeContext).type).to.deep.equal('aDifferentCollection')
      })
    })
  })
})
