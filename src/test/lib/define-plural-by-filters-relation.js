/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { definePluralByFiltersRelation } = require('../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('definePluralByFiltersRelation', () => {
  it('should throw if no parentType is given', () => {
    return expect(() => definePluralByFiltersRelation()).to.throw('definePluralByFiltersRelation requires a parentType')
  })

  it('should throw if no type is given', () => {
    return expect(() => definePluralByFiltersRelation({
      parentType: 'Parent'
    })).to.throw('definePluralByFiltersRelation requires a type')
  })

  it('should return an object', () => {
    return expect(definePluralByFiltersRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(definePluralByFiltersRelation({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relationsByFilters(filters: RelationFilterInput!): [Relation!]!
      }
    `)
  })

  it('should return resolver for Parent.relationsByFilters', () => {
    return expect(definePluralByFiltersRelation({
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
      resolver = definePluralByFiltersRelation({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relationsByFilters
    })

    it('should return the result of a store.readAll call', () => {
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readAll: () => 'all_the_relations'
      })
      return expect(resolver(null, { filters }, fakeContext)).to.eventually.equal('all_the_relations')
    })

    it('should call store.readAll with the collection type', () => {
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readAll: args => args
      })
      return expect(resolver(null, { filters }, fakeContext))
        .to.eventually.have.property('type')
        .to.equal('relations')
    })

    it('should call store.readAll with the filters passed in args', () => {
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readAll: args => args
      })
      return expect(resolver(null, { filters }, fakeContext))
        .to.eventually.have.property('filters')
        .to.deep.equal({
          slug: 'someSlug'
        })
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      return expect(definePluralByFiltersRelation({
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
        const filters = {
          slug: 'someSlug'
        }
        const resolver = definePluralByFiltersRelation({
          parentType: 'Parent',
          type: 'Relation',
          collection: 'aDifferentCollection'
        }).resolvers.Parent.relationsByFilters
        const fakeContext = generateFakeContextWithStore({
          readAll: args => args
        })
        return expect(resolver(null, { filters }, fakeContext))
          .to.eventually.have.property('type')
          .to.deep.equal('aDifferentCollection')
      })
    })
  })

  describe('when the filterType is passed in', () => {
    it('should override the filterType', () => {
      return expect(definePluralByFiltersRelation({
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
})
