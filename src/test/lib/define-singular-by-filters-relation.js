/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { defineSingularByFiltersRelation } = require('../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('defineSingularByFiltersRelation', () => {
  it('should throw if no parentType is given', () => {
    expect(() => defineSingularByFiltersRelation()).to.throw('defineSingularByFiltersRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    expect(() => defineSingularByFiltersRelation({
      parentType: 'Parent'
    })).to.throw('defineSingularByFiltersRelation requires a type')
  })

  it('should return an object', () => {
    expect(defineSingularByFiltersRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    expect(defineSingularByFiltersRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relationByFilters(filters: RelationFilterInput!): Relation
      }
    `)
  })

  it('should return resolver for Parent.relationByFilters', () => {
    expect(defineSingularByFiltersRelation({
      parentType: 'Parent',
      type: 'Relation'
    }))
    .to.have.property('resolvers')
    .to.have.property('Parent')
    .to.have.property('relationByFilters')
  })

  describe('the resolver', () => {
    let resolver

    beforeEach(() => {
      resolver = defineSingularByFiltersRelation({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relationByFilters
    })

    it('should be a function', () => {
      expect(resolver).to.be.a('function')
    })

    it('should return the result of a store.readOne call', () => {
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: () => 'the_relation'
      })
      expect(resolver(null, { filters }, fakeContext)).to.equal('the_relation')
    })

    it('should call store.readOne with the collection type', () => {
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => args
      })
      expect(resolver(null, { filters }, fakeContext).type).to.equal('relations')
    })

    it('should call store.readOne with the filters passed in args', () => {
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => args
      })
      expect(resolver(null, { filters }, fakeContext).filters).to.deep.equal({
        slug: 'someSlug'
      })
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      expect(defineSingularByFiltersRelation({
        parentType: 'Parent',
        type: 'Relation',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        aDifferentName(filters: RelationFilterInput!): Relation!
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should override the type passed to store.readOne', () => {
        const resolver = defineSingularByFiltersRelation({
          parentType: 'Parent',
          type: 'Relation',
          collection: 'aDifferentCollection'
        }).resolvers.Parent.relationByFilters
        const filters = {
          slug: 'someSlug'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => args
        })
        expect(resolver(null, { filters }, fakeContext).type).to.deep.equal('aDifferentCollection')
      })
    })
  })

  describe('when the filterType is passed in', () => {
    it('should override the filterType', () => {
      expect(defineSingularByFiltersRelation({
        parentType: 'Parent',
        type: 'Relation',
        filterType: 'aDifferentFilterType'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relationByFilters(filters: aDifferentFilterType!): Relation!
      }
    `)
    })
  })
})
