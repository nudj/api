/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { nestedCountByFilters } = require('../../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('nestedCountByFilters', () => {
  it('should throw if no parentType is given', () => {
    return expect(() => nestedCountByFilters()).to.throw('nestedCountByFilters requires a parentType')
  })

  it('should throw if no type is given', () => {
    return expect(() => nestedCountByFilters({
      parentType: 'Parent'
    })).to.throw('nestedCountByFilters requires a type')
  })

  it('should return an object', () => {
    return expect(nestedCountByFilters({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(nestedCountByFilters({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relationsCountByFilters(filters: RelationFilterInput!): Int!
      }
    `)
  })

  it('should return resolver for Parent.relationsByFilters', () => {
    return expect(nestedCountByFilters({
      parentType: 'Parent',
      type: 'Relation'
    }))
    .to.have.property('resolvers')
    .to.have.property('Parent')
    .to.have.property('relationsCountByFilters')
  })

  describe('the resolver', () => {
    let resolver

    beforeEach(() => {
      resolver = nestedCountByFilters({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relationsCountByFilters
    })

    it('should call store.countByFilters', () => {
      const parent = {
        id: 'parent1'
      }
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        countByFilters: () => 'calling store.countByFilters'
      })
      return expect(resolver(parent, { filters }, fakeContext))
        .to.eventually.equal('calling store.countByFilters')
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      return expect(nestedCountByFilters({
        parentType: 'Parent',
        type: 'Relation',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        aDifferentName(filters: RelationFilterInput!): Int!
      }
    `)
    })
  })

  describe('when the filterType is passed in', () => {
    it('should override the filterType', () => {
      return expect(nestedCountByFilters({
        parentType: 'Parent',
        type: 'Relation',
        filterType: 'aDifferentFilterType'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relationsCountByFilters(filters: aDifferentFilterType!): Int!
      }
    `)
    })
  })
})
