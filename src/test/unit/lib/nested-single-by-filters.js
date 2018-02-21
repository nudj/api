/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const { nestedSingleByFilters } = require('../../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

describe('nestedSingleByFilters', () => {
  it('should throw if no parentType is given', () => {
    return expect(() => nestedSingleByFilters()).to.throw('nestedSingleByFilters requires a parentType')
  })

  it('should throw if no type is given', () => {
    return expect(() => nestedSingleByFilters({
      parentType: 'Parent'
    })).to.throw('nestedSingleByFilters requires a type')
  })

  it('should return an object', () => {
    return expect(nestedSingleByFilters({
      parentType: 'Parent',
      type: 'Relation'
    })).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(nestedSingleByFilters({
      parentType: 'Parent',
      type: 'Relation'
    })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relationByFilters(filters: RelationFilterInput!): Relation
      }
    `)
  })

  it('should return resolver for Parent.relationByFilters', () => {
    return expect(nestedSingleByFilters({
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
      resolver = nestedSingleByFilters({
        parentType: 'Parent',
        type: 'Relation'
      }).resolvers.Parent.relationByFilters
    })

    it('should return the result of a store.readOne call', () => {
      const parent = {
        id: 'parent1'
      }
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: () => Promise.resolve('the_relation')
      })
      return expect(resolver(parent, { filters }, fakeContext)).to.eventually.equal('the_relation')
    })

    it('should call store.readOne with the collection type', () => {
      const parent = {
        id: 'parent1'
      }
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      return expect(resolver(parent, { filters }, fakeContext))
        .to.eventually.have.deep.property('type')
        .to.deep.equal('relations')
    })

    it('should call store.readOne with filters merged with parent.id', () => {
      const parent = {
        id: 'parent1'
      }
      const filters = {
        slug: 'someSlug'
      }
      const fakeContext = generateFakeContextWithStore({
        readOne: args => Promise.resolve(args)
      })
      return expect(resolver(parent, { filters }, fakeContext))
        .to.eventually.have.deep.property('filters')
        .to.deep.equal({
          parent: 'parent1',
          slug: 'someSlug'
        })
    })
  })

  // optional parameters

  describe('when the name is passed in', () => {
    it('should override the name', () => {
      return expect(nestedSingleByFilters({
        parentType: 'Parent',
        type: 'Relation',
        name: 'aDifferentName'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        aDifferentName(filters: RelationFilterInput!): Relation
      }
    `)
    })
  })

  describe('when the filterType is passed in', () => {
    it('should override the filterType', () => {
      return expect(nestedSingleByFilters({
        parentType: 'Parent',
        type: 'Relation',
        filterType: 'aDifferentFilterType'
      })).to.have.property('typeDefs').to.equal(`
      extend type Parent {
        relationByFilters(filters: aDifferentFilterType!): Relation
      }
    `)
    })
  })

  describe('when the collection is passed in', () => {
    describe('the resolver', () => {
      it('should override the type passed to store.readOne', () => {
        const resolver = nestedSingleByFilters({
          parentType: 'Parent',
          type: 'Relation',
          collection: 'aDifferentCollection'
        }).resolvers.Parent.relationByFilters
        const parent = {
          id: 'parent1'
        }
        const filters = {
          slug: 'someSlug'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => Promise.resolve(args)
        })
        return expect(resolver(parent, { filters }, fakeContext))
          .to.eventually.have.deep.property('type')
          .to.deep.equal('aDifferentCollection')
      })
    })
  })

  describe('when parentName is passed in', () => {
    describe('the resolver', () => {
      it('should override key in filters for parent.id', () => {
        const resolver = nestedSingleByFilters({
          parentType: 'Parent',
          parentName: 'aDifferentName',
          type: 'Relation'
        }).resolvers.Parent.relationByFilters
        const parent = {
          id: 'parent1'
        }
        const filters = {
          slug: 'someSlug'
        }
        const fakeContext = generateFakeContextWithStore({
          readOne: args => Promise.resolve(args)
        })
        return expect(resolver(parent, { filters }, fakeContext))
          .to.eventually.have.deep.property('filters')
          .to.deep.equal({
            aDifferentName: 'parent1',
            slug: 'someSlug'
          })
      })
    })
  })
})
