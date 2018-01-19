/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { nestedSingleForeign } = require('../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('nestedSingleForeign', () => {
  it('should throw if no parentType is given', () => {
    return expect(() => nestedSingleForeign()).to.throw('nestedSingleForeign requires a parentType')
  })

  it('should throw if no type is given', () => {
    return expect(() => nestedSingleForeign({
      parentType: 'Parent'
    })).to.throw('nestedSingleForeign requires a type')
  })

  it('should return an object', () => {
    return expect(nestedSingleForeign({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(nestedSingleForeign({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relation: Relation
      }
    `)
  })

  it('should return resolver for Parent.relation', () => {
    return expect(nestedSingleForeign({
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
      resolver = nestedSingleForeign({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relation
    })

    it('should return the result of a store.readOne call', () => {
      const parent = {
        id: 'parent1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: () => Promise.resolve('the_relation')
      })
      return expect(resolver(parent, null, fakeContext)).to.eventually.equal('the_relation')
    })

    it('should call store.readOne with the collection type', () => {
      const parent = {
        id: 'parent1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('type', 'relations')
    })

    it('should call store.readOne with filters', () => {
      const parent = {
        id: 'parent1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      return expect(resolver(parent, null, fakeContext))
        .to.eventually.have.deep.property('filters')
        .to.deep.equal({
          parent: 'parent1'
        })
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      return expect(nestedSingleForeign({
        parentType: 'Parent',
        type: 'Relation',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        aDifferentName: Relation
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    it('should override the type passed to store.readOne', () => {
      const resolver = nestedSingleForeign({
        parentType: 'Parent',
        type: 'Relation',
        collection: 'aDifferentCollection'
      }).resolvers.Parent.relation
      const parent = {
        id: 'parent1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('type', 'aDifferentCollection')
    })
  })

  describe('when propertyName is passed in', () => {
    it('should override property used to filter the parent id on the children', () => {
      const resolver = nestedSingleForeign({
        parentType: 'Parent',
        type: 'Relation',
        propertyName: 'aDifferentPropertyName'
      }).resolvers.Parent.relation
      const parent = {
        id: 'parent1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      return expect(resolver(parent, null, fakeContext))
        .to.eventually.have.deep.property('filters')
        .to.deep.equal({
          aDifferentPropertyName: 'parent1'
        })
    })
  })
})
