/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { defineEntityPluralRelation } = require('../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('defineEntityPluralRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => defineEntityPluralRelation()).to.throw('defineEntityPluralRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    expect(() => defineEntityPluralRelation({
      parentType: 'Parent'
    })).to.throw('defineEntityPluralRelation requires a type')
  })

  it('should return an object', () => {
    expect(defineEntityPluralRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(defineEntityPluralRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relations: [Relation!]!
      }
    `)
  })

  it('should return resolver for Parent.relations', () => {
    expect(defineEntityPluralRelation({
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
      resolver = defineEntityPluralRelation({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relations
    })

    it('should return the result of a store.readAll call', () => {
      const parent = {
        id: 'parentId'
      }
      const fakeContext = generateFakeContextWithStore({
        readAll: () => 'all_the_relations'
      })
      expect(resolver(parent, null, fakeContext)).to.eventually.equal('all_the_relations')
    })

    it('should call store.readAll with the collection type', () => {
      const parent = {
        id: 'parentId'
      }
      const fakeContext = generateFakeContextWithStore({
        readAll: args => args
      })
      expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('type', 'relations')
    })

    it('should call store.readAll with filters based on parent.id', () => {
      const parent = {
        id: 'parent1'
      }
      const fakeContext = generateFakeContextWithStore({
        readAll: args => args
      })
      expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('filters', {
        parent: 'parent1'
      })
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      expect(defineEntityPluralRelation({
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
        const resolver = defineEntityPluralRelation({
          parentType: 'Parent',
          type: 'Relation',
          collection: 'aDifferentCollection'
        }).resolvers.Parent.relations
        const parent = {
          id: 'parentId'
        }
        const fakeContext = generateFakeContextWithStore({
          readAll: args => args
        })
        expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('type', 'aDifferentCollection')
      })
    })
  })

  describe('when parentName is passed in', () => {
    describe('the resolver', () => {
      it('should override key in filters for parent.id', () => {
        const resolver = defineEntityPluralRelation({
          parentType: 'Parent',
          parentName: 'aDifferentName',
          type: 'Relation'
        }).resolvers.Parent.relations
        const parent = {
          id: 'parent1'
        }
        const fakeContext = generateFakeContextWithStore({
          readAll: args => args
        })
        expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('filters', {
          aDifferentName: 'parent1'
        })
      })
    })
  })

  describe('when parent has array of child ids', () => {
    describe('the resolver', () => {
      let resolver

      beforeEach(() => {
        resolver = defineEntityPluralRelation({
          parentType: 'Parent',
          type: 'Relation'
        }).resolvers.Parent.relations
      })

      it('should return the result of a store.readMany call', () => {
        const parent = {
          relations: ['relation1']
        }
        const fakeContext = generateFakeContextWithStore({
          readMany: () => 'the_requested_relations'
        })
        expect(resolver(parent, null, fakeContext)).to.eventually.equal('the_requested_relations')
      })

      it('should call store.readMany with the collection type', () => {
        const parent = {
          relations: ['relation1']
        }
        const fakeContext = generateFakeContextWithStore({
          readMany: args => args
        })
        expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('type', 'relations')
      })

      it('should call store.readMany with ids based on array stored in parent', () => {
        const parent = {
          relations: ['relation1']
        }
        const fakeContext = generateFakeContextWithStore({
          readMany: args => args
        })
        expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('ids', ['relation1'])
      })
    })

    describe('when parentPropertyName is passed in', () => {
      describe('the resolver', () => {
        let resolver

        beforeEach(() => {
          resolver = defineEntityPluralRelation({
            parentType: 'Parent',
            type: 'Relation',
            parentPropertyName: 'aDifferentParentPropertyName'
          }).resolvers.Parent.relations
        })

        it('should call store.readMany with ids based on array stored in parent', () => {
          const parent = {
            aDifferentParentPropertyName: ['relation1']
          }
          const fakeContext = generateFakeContextWithStore({
            readMany: args => args
          })
          expect(resolver(parent, null, fakeContext)).to.eventually.have.deep.property('ids', ['relation1'])
        })
      })
    })
  })
})
