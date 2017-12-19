/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { defineEntitySingularRelation } = require('../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('defineEntitySingularRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => defineEntitySingularRelation()).to.throw('defineEntitySingularRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    expect(() => defineEntitySingularRelation({
      parentType: 'Parent'
    })).to.throw('defineEntitySingularRelation requires a type')
  })

  it('should return an object', () => {
    expect(defineEntitySingularRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(defineEntitySingularRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relation: Relation
      }
    `)
  })

  it('should return resolver for Parent.relation', () => {
    expect(defineEntitySingularRelation({
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

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should return the result of a store.readOne call', () => {
      const parent = {
        relation: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: () => 'the_relation'
      })
      expect(resolver(parent, null, fakeContext)).to.equal('the_relation')
    })

    it('should call store.readOne with the collection type', () => {
      const parent = {
        relation: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => args
      })
      expect(resolver(parent, null, fakeContext).type).to.equal('relations')
    })

    it('should call store.readOne with the id', () => {
      const parent = {
        relation: 'relation1'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => args
      })
      expect(resolver(parent, null, fakeContext).id).to.equal('relation1')
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      expect(defineEntitySingularRelation({
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

      it('should be keyed with the name passed in', () => {
        expect(resolver).to.be.a('function')
      })

      it('should override property used to get the child id from the parent', () => {
        const parent = {
          relation: 'relation1',
          aDifferentName: 'theActualId'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => args
        })
        expect(resolver(parent, null, fakeContext).id).to.equal('theActualId')
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
        expect(resolver(parent, null, fakeContext).type).to.deep.equal('aDifferentCollection')
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
        expect(resolver(parent, null, fakeContext).id).to.equal('theActualId')
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
        expect(resolver(parent, null, fakeContext).id).to.equal('theActualId')
      })
    })
  })
})
