/* eslint-env mocha */
const chai = require('chai')
const clone = require('lodash/cloneDeep')
const readOneViaEdgeCollection = require('../../../../gql/lib/helpers/read-one-via-edge-collection')
const { createTestContext } = require('../../helpers')

const expect = chai.expect

const baseDb = {
  politicians: [{
    id: 'politician1'
  }],
  quotes: [
    { id: 'quote1', speaker: 'trump', body: 'no way folks, no way' },
    { id: 'quote2', speaker: 'beto o\'rourke', body: 'I have a silly name, really' }
  ],
  politicianQuotes: [{
    id: 'politicianQuote1',
    quote: 'quote1',
    politician: 'politician1'
  }, {
    id: 'politicianQuote2',
    quote: 'quote2',
    politician: 'politician2'
  }]
}

describe('readOneViaEdgeCollection', () => {
  let context
  let db
  beforeEach(() => {
    db = clone(baseDb)
    context = createTestContext(db)
  })

  describe('when `type` is not provided', () => {
    it('throws an error', async () => {
      expect(readOneViaEdgeCollection({
        store: context.store,
        edge: 'politicianQuotes',
        fromPropertyName: 'politician',
        toPropertyName: 'quote',
        fromData: { id: 'politician1' },
        filters: { speaker: 'trump' }
      })).to.eventually.be.rejectedWith('readOneViaEdgeCollection requires a type')
    })
  })

  describe('when `edge` is not provided', () => {
    it('throws an error', async () => {
      expect(readOneViaEdgeCollection({
        type: 'quotes',
        store: context.store,
        fromPropertyName: 'politician',
        toPropertyName: 'quote',
        fromData: { id: 'politician1' },
        filters: { speaker: 'trump' }
      })).to.eventually.be.rejectedWith('readOneViaEdgeCollection requires an edge')
    })
  })

  describe('when `store` is not provided', () => {
    it('throws an error', async () => {
      expect(readOneViaEdgeCollection({
        type: 'quotes',
        edge: 'politicianQuotes',
        fromPropertyName: 'politician',
        toPropertyName: 'quote',
        fromData: { id: 'politician1' },
        filters: { speaker: 'trump' }
      })).to.eventually.be.rejectedWith('readOneViaEdgeCollection requires a store')
    })
  })

  describe('when `fromPropertyName` is not provided', () => {
    it('throws an error', async () => {
      expect(readOneViaEdgeCollection({
        type: 'quotes',
        store: context.store,
        edge: 'politicianQuotes',
        toPropertyName: 'quote',
        fromData: { id: 'politician1' },
        filters: { speaker: 'trump' }
      })).to.eventually.be.rejectedWith('readOneViaEdgeCollection requires a fromPropertyName')
    })
  })

  describe('when `toPropertyName` is not provided', () => {
    it('throws an error', async () => {
      expect(readOneViaEdgeCollection({
        type: 'quotes',
        store: context.store,
        edge: 'politicianQuotes',
        fromPropertyName: 'politician',
        fromData: { id: 'politician1' },
        filters: { speaker: 'trump' }
      })).to.eventually.be.rejectedWith('readOneViaEdgeCollection requires a toPropertyName')
    })
  })

  describe('when `fromData` is not provided', () => {
    it('throws an error', async () => {
      expect(readOneViaEdgeCollection({
        type: 'quotes',
        store: context.store,
        edge: 'politicianQuotes',
        fromPropertyName: 'politician',
        toPropertyName: 'quote',
        filters: { speaker: 'trump' }
      })).to.eventually.be.rejectedWith('readOneViaEdgeCollection requires a fromData')
    })
  })

  describe('when the item related to the edge exists', () => {
    let result
    beforeEach(async () => {
      result = await readOneViaEdgeCollection({
        store: context.store,
        type: 'quotes',
        edge: 'politicianQuotes',
        fromPropertyName: 'politician',
        toPropertyName: 'quote',
        fromData: { id: 'politician1' },
        filters: { speaker: 'trump' }
      })
    })
    afterEach(async () => {
      result = undefined
    })

    it('returns the related item', async () => {
      expect(result).to.deep.equal(db.quotes[0])
    })
  })

  describe('when the item related to the edge does not exist', () => {
    let result
    beforeEach(async () => {
      db.quotes = [{
        id: 'quote2',
        speaker: 'trump'
      }]
      result = await readOneViaEdgeCollection({
        store: context.store,
        type: 'quotes',
        edge: 'politicianQuotes',
        fromPropertyName: 'politician',
        toPropertyName: 'quote',
        fromData: { id: 'politician1' },
        filters: { speaker: 'trump' }
      })
    })
    afterEach(async () => {
      result = undefined
    })

    it('returns null', async () => {
      expect(result).to.be.null()
    })
  })

  describe('when no item matching the filters exists', () => {
    let result
    beforeEach(async () => {
      db.quotes = [{
        id: 'quote1',
        speaker: 'hillary-clinton'
      }]
      result = await readOneViaEdgeCollection({
        store: context.store,
        type: 'quotes',
        edge: 'politicianQuotes',
        fromPropertyName: 'politician',
        toPropertyName: 'quote',
        fromData: { id: 'politician1' },
        filters: { speaker: 'trump' }
      })
    })
    afterEach(async () => {
      result = undefined
    })

    it('returns null', async () => {
      expect(result).to.be.null()
    })
  })

  describe('when the edge does not exist', () => {
    let result
    beforeEach(async () => {
      db.politicianQuotes = []
      result = await readOneViaEdgeCollection({
        store: context.store,
        type: 'quotes',
        edge: 'politicianQuotes',
        fromPropertyName: 'politician',
        toPropertyName: 'quote',
        fromData: { id: 'politician1' },
        filters: { speaker: 'trump' }
      })
    })
    afterEach(async () => {
      result = undefined
    })

    it('returns null', async () => {
      expect(result).to.be.null()
    })
  })
})
