/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { definePluralRelation } = require('../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('definePluralRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => definePluralRelation()).to.throw('definePluralRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    expect(() => definePluralRelation({
      parentType: 'Parent'
    })).to.throw('definePluralRelation requires a type')
  })

  it('should return an object', () => {
    expect(definePluralRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(definePluralRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relations: [Relation!]!
      }
    `)
  })

  it('should return resolver for Parent.relations', () => {
    expect(definePluralRelation({
      parentType: 'Parent',
      type: 'Relation'
    }))
    .to.have.property('resolvers')
    .to.have.property('Parent')
    .to.have.property('relations')
  })

  describe('the resolver', () => {
    let resolver

    beforeEach(() => {
      resolver = definePluralRelation({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relations
    })

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should return the result of a store.readAll call', () => {
      const fakeContext = generateFakeContextWithStore({
        readAll: () => 'all_the_relations'
      })
      expect(resolver(null, null, fakeContext)).to.equal('all_the_relations')
    })

    it('should call store.readAll with the collection type', () => {
      const fakeContext = generateFakeContextWithStore({
        readAll: args => args
      })
      expect(resolver(null, null, fakeContext).type).to.equal('relations')
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      expect(definePluralRelation({
        parentType: 'Parent',
        type: 'Relation',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        aDifferentName: [Relation!]!
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should override the type passed to store.readAll', () => {
        const resolver = definePluralRelation({
          parentType: 'Parent',
          type: 'Relation',
          collection: 'aDifferentCollection'
        }).resolvers.Parent.relations
        const fakeContext = generateFakeContextWithStore({
          readAll: args => args
        })
        expect(resolver(null, null, fakeContext).type).to.deep.equal('aDifferentCollection')
      })
    })
  })
})
