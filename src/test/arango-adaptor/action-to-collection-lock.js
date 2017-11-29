/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const ActionToCollectionLock = require('../../gql/arango-adaptor/action-to-collection-lock')

describe('ArangoAdaptor ActionToCollectionLock', () => {
  it('to be a function', () => {
    expect(ActionToCollectionLock).to.be.a('function')
  })

  it('should take an action', () => {
    expect(() => ActionToCollectionLock()).to.throw('No action supplied')
  })

  describe('return value', () => {
    it('should be an array', () => {
      expect(ActionToCollectionLock(() => {})).to.be.an('array')
    })

    it('should handle create actions', () => {
      expect(ActionToCollectionLock((store) => {
        store.create({
          type: 'createCollection'
        })
      })).to.deep.equal(['createCollection'])
    })

    it('should handle readOneOrCreate actions', () => {
      expect(ActionToCollectionLock((store) => {
        store.readOneOrCreate({
          type: 'readOneOrCreateCollection'
        })
      })).to.deep.equal(['readOneOrCreateCollection'])
    })

    it('should handle update actions', () => {
      expect(ActionToCollectionLock((store) => {
        store.update({
          type: 'updateCollection'
        })
      })).to.deep.equal(['updateCollection'])
    })

    it('should handle updateOrCreate actions', () => {
      expect(ActionToCollectionLock((store) => {
        store.updateOrCreate({
          type: 'updateOrCreateCollection'
        })
      })).to.deep.equal(['updateOrCreateCollection'])
    })

    it('should handle delete actions', () => {
      expect(ActionToCollectionLock((store) => {
        store.delete({
          type: 'deleteCollection'
        })
      })).to.deep.equal(['deleteCollection'])
    })

    it('should handle multiple actions', () => {
      expect(ActionToCollectionLock((store) => {
        store.create({
          type: 'createCollection'
        })
        store.readOneOrCreate({
          type: 'readOneOrCreateCollection'
        })
        store.update({
          type: 'updateCollection'
        })
        store.updateOrCreate({
          type: 'updateOrCreateCollection'
        })
        store.delete({
          type: 'deleteCollection'
        })
      })).to.deep.equal([
        'createCollection',
        'readOneOrCreateCollection',
        'updateCollection',
        'updateOrCreateCollection',
        'deleteCollection'
      ])
    })

    it('should ignore read only actions', () => {
      expect(ActionToCollectionLock((store) => {
        store.readOne({
          type: 'readOneCollection'
        })
        store.readMany({
          type: 'readManyCollection'
        })
        store.readAll({
          type: 'readAllCollection'
        })
      })).to.deep.equal([])
    })
  })
})
