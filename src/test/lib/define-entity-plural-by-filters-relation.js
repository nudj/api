/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { defineEntityPluralByFiltersRelation } = require('../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('defineEntityPluralByFiltersRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => defineEntityPluralByFiltersRelation()).to.throw('defineEntityPluralByFiltersRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    expect(() => defineEntityPluralByFiltersRelation({
      parentType: 'Parent'
    })).to.throw('defineEntityPluralByFiltersRelation requires a type')
  })

  it('should return an object', () => {
    expect(defineEntityPluralByFiltersRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(defineEntityPluralByFiltersRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relationsByFilters(filters: RelationFilterInput!): [Relation!]!
      }
    `)
  })

  it('should return resolver for Parent.relationsByFilters', () => {
    expect(defineEntityPluralByFiltersRelation({
      parentType: 'Parent',
      type: 'Relation'
    }))
    .to.have.property('resolvers')
    .to.have.property('Parent')
    .to.have.property('relationsByFilters')
  })

  describe('the resolver', () => {
    let resolver

    beforeEach(() => {
      resolver = defineEntityPluralByFiltersRelation({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relationsByFilters
    })

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should return the result of a store.readAll call', () => {
      const parent = {
        id: 'parent1'
      }
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readAll: () => 'all_the_relations'
      })
      expect(resolver(parent, { filters }, fakeContext)).to.equal('all_the_relations')
    })

    it('should call store.readAll with the collection type', () => {
      const parent = {
        id: 'parent1'
      }
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readAll: args => args
      })
      expect(resolver(parent, { filters }, fakeContext).type).to.equal('relations')
    })

    it('should call store.readAll with filters merged with parent.id', () => {
      const parent = {
        id: 'parent1'
      }
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readAll: args => args
      })
      expect(resolver(parent, { filters }, fakeContext).filters).to.deep.equal({
        parent: 'parent1',
        slug: 'someSlug'
      })
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      expect(defineEntityPluralByFiltersRelation({
        parentType: 'Parent',
        type: 'Relation',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        aDifferentName(filters: RelationFilterInput!): [Relation!]!
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should override the type passed to store.readAll', () => {
        const resolver = defineEntityPluralByFiltersRelation({
          parentType: 'Parent',
          type: 'Relation',
          collection: 'aDifferentCollection'
        }).resolvers.Parent.relationsByFilters
        const parent = {
          id: 'parent1'
        }
        const filters = {
          slug: 'someSlug'
        }
        const fakeContext = generateFakeContextWithStore({
          readAll: args => args
        })
        expect(resolver(parent, { filters }, fakeContext).type).to.deep.equal('aDifferentCollection')
      })
    })
  })

  describe('when the filterType is passed in', () => {
    it('should override the filterType', () => {
      expect(defineEntityPluralByFiltersRelation({
        parentType: 'Parent',
        type: 'Relation',
        filterType: 'aDifferentFilterType'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relationsByFilters(filters: aDifferentFilterType!): [Relation!]!
      }
    `)
    })
  })

  describe('when parentName is passed in', () => {
    describe('the resolver', () => {
      it('should override key in filters for parent.id', () => {
        const resolver = defineEntityPluralByFiltersRelation({
          parentType: 'Parent',
          parentName: 'aDifferentName',
          type: 'Relation'
        }).resolvers.Parent.relationsByFilters
        const parent = {
          id: 'parent1'
        }
        const filters = {
          slug: 'someSlug'
        }
        const fakeContext = generateFakeContextWithStore({
          readAll: args => args
        })
        expect(resolver(parent, { filters }, fakeContext).filters).to.deep.equal({
          aDifferentName: 'parent1',
          slug: 'someSlug'
        })
      })
    })
  })
})