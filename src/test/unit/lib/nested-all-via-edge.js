/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect

const { nestedAllViaEdge } = require('../../../gql/lib')
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

describe('nestedAllViaEdge', () => {
  it('should throw if no fromType is given', () => {
    return expect(() => nestedAllViaEdge()).to.throw('nestedAllViaEdge requires a fromType')
  })

  it('should throw if no toType is given', () => {
    return expect(() => nestedAllViaEdge({
      fromType: config.fromType
    })).to.throw('nestedAllViaEdge requires a toType')
  })

  it('should throw if no name is given', () => {
    return expect(() => nestedAllViaEdge({
      fromType: config.fromType,
      toType: config.toType
    })).to.throw('nestedAllViaEdge requires a name')
  })

  it('should throw if no edgeCollection is given', () => {
    return expect(() => nestedAllViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name
    })).to.throw('nestedAllViaEdge requires a edgeCollection')
  })

  it('should throw if no toCollection is given', () => {
    return expect(() => nestedAllViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name,
      edgeCollection: config.edgeCollection
    })).to.throw('nestedAllViaEdge requires a toCollection')
  })

  it('should throw if no fromEdgePropertyName is given', () => {
    return expect(() => nestedAllViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name,
      edgeCollection: config.edgeCollection,
      toCollection: config.toCollection
    })).to.throw('nestedAllViaEdge requires a fromEdgePropertyName')
  })

  it('should throw if no toEdgePropertyName is given', () => {
    return expect(() => nestedAllViaEdge({
      fromType: config.fromType,
      toType: config.toType,
      name: config.name,
      edgeCollection: config.edgeCollection,
      toCollection: config.toCollection,
      fromEdgePropertyName: config.fromEdgePropertyName
    })).to.throw('nestedAllViaEdge requires a toEdgePropertyName')
  })

  it('should return an object', () => {
    return expect(nestedAllViaEdge(config)).to.be.an('object')
  })

  it('should return the typeDefs', () => {
    return expect(nestedAllViaEdge(config)).to.have.property('typeDefs').to.equal(`
      extend type ${config.fromType} {
        ${config.name}: [${config.toType}!]!
      }
    `)
  })

  it('should return resolver for From.to', () => {
    return expect(nestedAllViaEdge(config))
    .to.have.property('resolvers')
    .to.have.property(config.fromType)
    .to.have.property(config.name)
  })

  describe('the resolver', () => {
    let resolver
    let fakeContext
    let readAllStub
    let readManyStub
    const from = {
      id: 'from1'
    }

    beforeEach(() => {
      resolver = nestedAllViaEdge(config).resolvers[config.fromType][config.name]
      readAllStub = sinon.stub()
      readManyStub = sinon.stub()
      fakeContext = generateFakeContextWithStore({
        readAll: readAllStub,
        readMany: readManyStub
      })
    })

    afterEach(() => {
      readAllStub.reset()
      readManyStub.reset()
    })

    describe('when edges exist', () => {
      beforeEach(() => {
        readAllStub.returns([
          {
            [config.fromEdgePropertyName]: 'from1',
            [config.toEdgePropertyName]: 'to1'
          },
          {
            [config.fromEdgePropertyName]: 'from1',
            [config.toEdgePropertyName]: 'to2'
          }
        ])
        readManyStub.returns([
          {
            id: 'to1'
          },
          {
            id: 'to2'
          }
        ])
      })

      it('should fetch the edges', async () => {
        await resolver(from, null, fakeContext); expect(readAllStub).to.have.been.calledWith({
          type: config.edgeCollection,
          filters: {
            [config.fromEdgePropertyName]: from.id
          }
        })
      })

      it('should fetch the items', async () => {
        await resolver(from, null, fakeContext); expect(readManyStub).to.have.been.calledWith({
          type: config.toCollection,
          ids: ['to1', 'to2']
        })
      })

      it('should return the items', async () => {
        const result = await resolver(from, null, fakeContext); expect(result).to.deep.equal([
          {
            id: 'to1'
          },
          {
            id: 'to2'
          }
        ])
      })
    })

    describe('when edges do not exist', () => {
      beforeEach(() => {
        readAllStub.returns([])
      })

      it('should fetch the edges', async () => {
        await resolver(from, null, fakeContext); expect(readAllStub).to.have.been.calledWith({
          type: config.edgeCollection,
          filters: {
            [config.fromEdgePropertyName]: from.id
          }
        })
      })

      it('should not fetch the items', async () => {
        await resolver(from, null, fakeContext); expect(readManyStub).to.not.have.been.called()
      })

      it('should return empty array', async () => {
        const result = await resolver(from, null, fakeContext); expect(result).to.deep.equal([])
      })
    })
  })
})
