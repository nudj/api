/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { definePluralRelation } = require('../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('definePluralRelation', () => {
  it('should throw if no parentType is given', () => {
    return expect(() => definePluralRelation()).to.throw('definePluralRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    return expect(() => definePluralRelation({
      parentType: 'Parent'
    })).to.throw('definePluralRelation requires a type')
  })

  it('should return an object', () => {
    return expect(definePluralRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(definePluralRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relations: [Relation!]!
      }
    `)
  })

  it('should return resolver for Parent.relations', () => {
    return expect(definePluralRelation({
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

    it('should return the result of a store.readAll call', () => {
      const fakeContext = generateFakeContextWithStore({
        readAll: () => 'all_the_relations'
      })
      return expect(resolver(null, null, fakeContext)).to.eventually.equal('all_the_relations')
    })

    it('should call store.readAll with the collection type', () => {
      const fakeContext = generateFakeContextWithStore({
        readAll: args => args
      })
      return expect(resolver(null, null, fakeContext)).to.eventually.have.deep.property('type', 'relations')
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      return expect(definePluralRelation({
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
        return expect(resolver(null, null, fakeContext)).to.eventually.have.deep.property('type', 'aDifferentCollection')
      })
    })
  })
})
