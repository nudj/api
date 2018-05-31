/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect

const { nestedSingleViaEdge } = require('../../../gql/lib')
const { generateFakeContextWithStore } = require('../helpers')

const config = {
  fromType: 'From',
  toType: 'To',
  name: 'resolverName',
  edgeCollection: 'edgeCollection',
  toCollection: 'toCollection',
  fromEdgePropertyName: 'fromProperty',
  toEdgePropertyName: 'toProperty'
}

describe('nestedSingleViaEdge', () => {
  it('should throw if no fromType is given', () => {
    return expect(() => nestedSingleViaEdge()).to.throw('nestedSingleViaEdge requires a fromType')
  })

  it('should throw if no toType is given', () => {
    return expect(() => nestedSingleViaEdge({
      fromType: config.fromType
    })).to.throw('nestedSingleViaEdge requires a toType')
  })

  it('should throw if no name is given', () => {
    return expect(() => nestedSingleViaEdge({
      fromType: config.fromType,
      toType: config.toType
    })).to.throw('nestedSingleViaEdge requires a name')
  })

  it('should throw if no edgeCollection is given', () => {
    return expect(() => nestedSingleViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name
    })).to.throw('nestedSingleViaEdge requires a edgeCollection')
  })

  it('should throw if no toCollection is given', () => {
    return expect(() => nestedSingleViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name,
      edgeCollection: config.edgeCollection
    })).to.throw('nestedSingleViaEdge requires a toCollection')
  })

  it('should throw if no fromEdgePropertyName is given', () => {
    return expect(() => nestedSingleViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name,
      edgeCollection: config.edgeCollection,
      toCollection: config.toCollection
    })).to.throw('nestedSingleViaEdge requires a fromEdgePropertyName')
  })

  it('should throw if no toEdgePropertyName is given', () => {
    return expect(() => nestedSingleViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name,
      edgeCollection: config.edgeCollection,
      toCollection: config.toCollection,
      fromEdgePropertyName: config.fromEdgePropertyName
    })).to.throw('nestedSingleViaEdge requires a toEdgePropertyName')
  })

  it('should return an object', () => {
    return expect(nestedSingleViaEdge(config)).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(nestedSingleViaEdge(config)).to.have.property('typeDefs').to.equal(`
      extend type ${config.fromType} {
        ${config.name}: ${config.toType}
      }
    `)
  })

  it('should return resolver for From.to', () => {
    return expect(nestedSingleViaEdge(config))
    .to.have.property('resolvers')
    .to.have.property(config.fromType)
    .to.have.property(config.name)
  })

  describe('the resolver', () => {
    let resolver
    let fakeContext
    let readOneStub
    const from = {
      id: 'from1'
    }
    const args = null

    beforeEach(() => {
      resolver = nestedSingleViaEdge(config).resolvers[config.fromType][config.name]
      readOneStub = sinon.stub()
      fakeContext = generateFakeContextWithStore({
        readOne: readOneStub
      })
    })

    afterEach(() => {
      readOneStub.reset()
    })

    describe('when edge exists', () => {
      beforeEach(() => {
        readOneStub.onFirstCall().returns({
          [config.fromEdgePropertyName]: 'from1',
          [config.toEdgePropertyName]: 'to1'
        })
        readOneStub.returns({
          id: 'to1'
        })
      })

      it('should fetch the edge', async () => {
        await resolver(from, args, fakeContext); expect(readOneStub).to.have.been.calledWith({
          type: config.edgeCollection,
          filters: {
            [config.fromEdgePropertyName]: from.id
          }
        })
      })

      it('should fetch the item', async () => {
        await resolver(from, args, fakeContext); expect(readOneStub).to.have.been.calledWith({
          type: config.toCollection,
          id: 'to1'
        })
      })

      it('should return the item', async () => {
        const result = await resolver(from, args, fakeContext); expect(result).to.deep.equal({
          id: 'to1'
        })
      })
    })

    describe('when edge does not exist', () => {
      beforeEach(() => {
        readOneStub.onFirstCall().returns(null)
      })

      it('should fetch the edges', async () => {
        await resolver(from, args, fakeContext); expect(readOneStub).to.have.been.calledWith({
          type: config.edgeCollection,
          filters: {
            [config.fromEdgePropertyName]: from.id
          }
        })
      })

      it('should not fetch the item', async () => {
        await resolver(from, args, fakeContext); expect(readOneStub).to.not.have.been.calledTwice()
      })

      it('should return null', async () => {
        const result = await resolver(from, args, fakeContext); expect(result).to.be.null()
      })
    })
  })
})
