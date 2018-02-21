/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { nestedSingle } = require('../../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('nestedSingle', () => {
  it('should throw if no parentType is given', () => {
    return expect(() => nestedSingle()).to.throw('nestedSingle requires a parentType')
  })

  it('should throw if no type is given', () => {
    return expect(() => nestedSingle({
      parentType: 'Parent'
    })).to.throw('nestedSingle requires a type')
  })

  it('should return an object', () => {
    return expect(nestedSingle({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(nestedSingle({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relation: Relation
      }
    `)
  })

  it('should return resolver for Parent.relation', () => {
    return expect(nestedSingle({
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
      resolver = nestedSingle({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relation
    })

    it('should return the result of a store.readOne call', () => {
      const parent = {
        relation: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: () => Promise.resolve('the_relation')
      })
      return expect(resolver(parent, null, fakeContext)).to.eventually.equal('the_relation')
    })

    it('should call store.readOne with the collection type', () => {
      const parent = {
        relation: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('type', 'relations')
    })

    describe('when parent.relation exists', () => {
      it('should call store.readOne with the id', () => {
        const parent = {
          relation: 'relation1'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => Promise.resolve(args)
        })
        return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('id', 'relation1')
      })
    })

    describe('when parent.relation does not exist', () => {
      it('should return null', () => {
        const parent = {}
        return expect(resolver(parent)).to.eventually.be.null()
      })
    })

    describe('when parent.relation exists but is null', () => {
      it('should return null', () => {
        const parent = {
          relation: null
        }
        return expect(resolver(parent)).to.eventually.be.null()
      })
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      return expect(nestedSingle({
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
      const resolver = nestedSingle({
        parentType: 'Parent',
        type: 'Relation',
        collection: 'aDifferentCollection'
      }).resolvers.Parent.relation
      const parent = {
        relation: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('type', 'aDifferentCollection')
    })
  })

  describe('when propertyName is passed in', () => {
    it('should override property used to get the child id from the parent', () => {
      const resolver = nestedSingle({
        parentType: 'Parent',
        type: 'Relation',
        propertyName: 'aDifferentParentName'
      }).resolvers.Parent.relation
      const parent = {
        relation: 'relation1',
        aDifferentParentName: 'theActualId'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('id', 'theActualId')
    })
  })
})
