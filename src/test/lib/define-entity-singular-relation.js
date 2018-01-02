/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { defineEntitySingularRelation } = require('../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('defineEntitySingularRelation', () => {
  it('should throw if no parentType is given', () => {
    return expect(() => defineEntitySingularRelation()).to.throw('defineEntitySingularRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    return expect(() => defineEntitySingularRelation({
      parentType: 'Parent'
    })).to.throw('defineEntitySingularRelation requires a type')
  })

  it('should return an object', () => {
    return expect(defineEntitySingularRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(defineEntitySingularRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relation: Relation
      }
    `)
  })

  it('should return resolver for Parent.relation', () => {
    return expect(defineEntitySingularRelation({
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
      resolver = defineEntitySingularRelation({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relation
    })

    it('should return the result of a store.readOne call', () => {
      const parent = {
        relation: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: () => 'the_relation'
      })
      return expect(resolver(parent, null, fakeContext)).to.eventually.equal('the_relation')
    })

    it('should call store.readOne with the collection type', () => {
      const parent = {
        relation: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => args
      })
      return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('type', 'relations')
    })

    it('should call store.readOne with the id', () => {
      const parent = {
        relation: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => args
      })
      return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('id', 'relation1')
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      return expect(defineEntitySingularRelation({
        parentType: 'Parent',
        type: 'Relation',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        aDifferentName: Relation
      }
    `)
    })

    describe('the resolver', () => {
      let resolver

      beforeEach(() => {
        resolver = defineEntitySingularRelation({
          parentType: 'Parent',
          type: 'Relation',
          name: 'aDifferentName'
        }).resolvers.Parent.aDifferentName
      })

      it('should override property used to get the child id from the parent', () => {
        const parent = {
          relation: 'relation1',
          aDifferentName: 'theActualId'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => args
        })
        return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('id', 'theActualId')
      })
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should override the type passed to store.readOne', () => {
        const resolver = defineEntitySingularRelation({
          parentType: 'Parent',
          type: 'Relation',
          collection: 'aDifferentCollection'
        }).resolvers.Parent.relation
        const parent = {
          id: 'parent1'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => args
        })
        return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('type', 'aDifferentCollection')
      })
    })
  })

  describe('when propertyName is passed in', () => {
    describe('the resolver', () => {
      it('should override property used to get the child id from the parent', () => {
        const resolver = defineEntitySingularRelation({
          parentType: 'Parent',
          type: 'Relation',
          propertyName: 'aDifferentParentName'
        }).resolvers.Parent.relation
        const parent = {
          relation: 'relation1',
          aDifferentParentName: 'theActualId'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => args
        })
        return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('id', 'theActualId')
      })

      it('should take precidence over the \'name\' property', () => {
        const resolver = defineEntitySingularRelation({
          parentType: 'Parent',
          type: 'Relation',
          name: 'aDifferentName',
          propertyName: 'aDifferentParentName'
        }).resolvers.Parent.aDifferentName
        const parent = {
          relation: 'relation1',
          aDifferentParentName: 'theActualId'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => args
        })
        return expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('id', 'theActualId')
      })
    })
  })
})
