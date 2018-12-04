/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect

const { nestedSingleByFiltersViaEdge } = require('../../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

const config = {
  fromType: 'From',
  toType: 'To',
  name: 'resolverName',
  edgeCollection: 'edgeCollection',
  toCollection: 'toCollection',
  fromEdgePropertyName: 'fromProperty',
  toEdgePropertyName: 'toProperty',
  filterType: 'fromFilterInput'
}

describe('nestedSingleByFiltersViaEdge', () => {
  it('should throw if no fromType is given', () => {
    return expect(() => nestedSingleByFiltersViaEdge()).to.throw('nestedSingleByFiltersViaEdge requires a fromType')
  })

  it('should throw if no toType is given', () => {
    return expect(() => nestedSingleByFiltersViaEdge({
      fromType: config.fromType
    })).to.throw('nestedSingleByFiltersViaEdge requires a toType')
  })

  it('should throw if no name is given', () => {
    return expect(() => nestedSingleByFiltersViaEdge({
      fromType: config.fromType,
      toType: config.toType
    })).to.throw('nestedSingleByFiltersViaEdge requires a name')
  })

  it('should throw if no edgeCollection is given', () => {
    return expect(() => nestedSingleByFiltersViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name
    })).to.throw('nestedSingleByFiltersViaEdge requires a edgeCollection')
  })

  it('should throw if no toCollection is given', () => {
    return expect(() => nestedSingleByFiltersViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name,
      edgeCollection: config.edgeCollection
    })).to.throw('nestedSingleByFiltersViaEdge requires a toCollection')
  })

  it('should throw if no fromEdgePropertyName is given', () => {
    return expect(() => nestedSingleByFiltersViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name,
      edgeCollection: config.edgeCollection,
      toCollection: config.toCollection
    })).to.throw('nestedSingleByFiltersViaEdge requires a fromEdgePropertyName')
  })

  it('should throw if no toEdgePropertyName is given', () => {
    return expect(() => nestedSingleByFiltersViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name,
      edgeCollection: config.edgeCollection,
      toCollection: config.toCollection,
      fromEdgePropertyName: config.fromEdgePropertyName
    })).to.throw('nestedSingleByFiltersViaEdge requires a toEdgePropertyName')
  })

  it('should throw if no filterType is given', () => {
    return expect(() => nestedSingleByFiltersViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name,
      edgeCollection: config.edgeCollection,
      toCollection: config.toCollection,
      fromEdgePropertyName: config.fromEdgePropertyName,
      toEdgePropertyName: config.toEdgePropertyName
    })).to.throw('nestedSingleByFiltersViaEdge requires a filterType')
  })

  it('should return an object', () => {
    return expect(nestedSingleByFiltersViaEdge(config)).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(nestedSingleByFiltersViaEdge(config)).to.have.property('typeDefs').to.equal(`
      extend type ${config.fromType} {
        ${config.name}(filters: fromFilterInput): ${config.toType}
      }
    `)
  })

  it('should return resolver for From.to', () => {
    return expect(nestedSingleByFiltersViaEdge(config))
      .to.have.property('resolvers')
      .to.have.property(config.fromType)
      .to.have.property(config.name)
  })

  describe('the resolver', () => {
    let resolver
    let fakeContext
    let readAllStub
    const from = {
      id: 'from1'
    }
    const args = {
      filters: {
        key: 'value'
      }
    }

    beforeEach(() => {
      resolver = nestedSingleByFiltersViaEdge(config).resolvers[config.fromType][config.name]
      readAllStub = sinon.stub()
      fakeContext = generateFakeContextWithStore({
        readAll: readAllStub
      })
    })

    afterEach(() => {
      readAllStub.reset()
    })

    describe('when edges exist', () => {
      beforeEach(() => {
        readAllStub.onCall(0).returns([
          {
            [config.fromEdgePropertyName]: 'from1',
            [config.toEdgePropertyName]: 'to1'
          }
        ])
        readAllStub.onCall(1).returns([{
          id: 'to1'
        }])
      })

      it('should fetch the edges', async () => {
        await resolver(from, args, fakeContext); expect(readAllStub).to.have.been.calledWith({
          type: config.edgeCollection,
          filters: {
            [config.fromEdgePropertyName]: from.id
          }
        })
      })

      it('should fetch the item by filters', async () => {
        await resolver(from, args, fakeContext)

        expect(readAllStub).to.have.been.calledWith({
          type: config.toCollection,
          filters: args.filters
        })
      })

      it('should return the item', async () => {
        const result = await resolver(from, args, fakeContext)
        expect(result).to.deep.equal({
          id: 'to1'
        })
      })

      it('should return only the related item', async () => {
        readAllStub.onCall(1).returns([
          { id: 'to2' },
          { id: 'to1' },
          { id: 'to3' }
        ])
        const result = await resolver(from, args, fakeContext)
        expect(result).to.deep.equal({
          id: 'to1'
        })
      })
    })

    describe('when edges do not exist', () => {
      beforeEach(() => {
        readAllStub.returns([])
      })

      it('should fetch the edges', async () => {
        await resolver(from, args, fakeContext); expect(readAllStub).to.have.been.calledWith({
          type: config.edgeCollection,
          filters: {
            [config.fromEdgePropertyName]: from.id
          }
        })
      })

      it('should fetch the item by filters', async () => {
        await resolver(from, args, fakeContext)

        expect(readAllStub).to.have.been.calledWith({
          type: config.toCollection,
          filters: args.filters
        })
      })

      it('should return null', async () => {
        const result = await resolver(from, args, fakeContext); expect(result).to.be.null()
      })
    })

    describe('when filters do not return any items', () => {
      beforeEach(() => {
        readAllStub.returns([
          {
            [config.fromEdgePropertyName]: 'from1',
            [config.toEdgePropertyName]: 'to1'
          }
        ])
      })

      it('should fetch the edges', async () => {
        await resolver(from, args, fakeContext); expect(readAllStub).to.have.been.calledWith({
          type: config.edgeCollection,
          filters: {
            [config.fromEdgePropertyName]: from.id
          }
        })
      })

      it('should fetch the item by filters', async () => {
        await resolver(from, args, fakeContext)

        expect(readAllStub).to.have.been.calledWith({
          type: config.toCollection,
          filters: args.filters
        })
      })

      it('should return null', async () => {
        const result = await resolver(from, args, fakeContext); expect(result).to.be.null()
      })
    })

    describe('when filtered item id does not match any edge ids', () => {
      beforeEach(() => {
        readAllStub.returns([
          {
            [config.fromEdgePropertyName]: 'from1',
            [config.toEdgePropertyName]: 'to1'
          }
        ])
      })

      it('should fetch the edges', async () => {
        await resolver(from, args, fakeContext); expect(readAllStub).to.have.been.calledWith({
          type: config.edgeCollection,
          filters: {
            [config.fromEdgePropertyName]: from.id
          }
        })
      })

      it('should fetch the item by filters', async () => {
        await resolver(from, args, fakeContext)

        expect(readAllStub).to.have.been.calledWith({
          type: config.toCollection,
          filters: args.filters
        })
      })

      it('should return null', async () => {
        const result = await resolver(from, args, fakeContext); expect(result).to.be.null()
      })
    })
  })
})
