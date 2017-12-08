/* eslint-env mocha */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { NotFound } = require('@nudj/library/errors')
const expect = chai.expect

chai.use(chaiAsPromised)

const transaction = require('../../../gql/adaptors/lodash')

describe('LodashAdaptor transaction', () => {
  let db

  beforeEach(() => {
    db = {
      dogs: [
        {
          id: 'dog1',
          breed: 'Cocker Spaniel'
        },
        {
          id: 'dog2',
          breed: 'Dalmatian'
        },
        {
          id: 'dog3',
          breed: 'Alsatian'
        }
      ]
    }
  })

  it('create', () => {
    return transaction({ db })(store => {
      return store.create({
        type: 'dogs',
        data: {
          breed: 'Schnauzer'
        }
      })
    }).then(result => {
      expect(result).to.have.property('id')
      expect(result).to.have.property('breed').to.equal('Schnauzer')
      expect(db.dogs.length).to.equal(4)
      expect(db.dogs[3]).to.have.property('id')
      expect(db.dogs[3]).to.have.property('breed', 'Schnauzer')
    })
  })

  it('readOne', () => {
    return expect(transaction({ db })(store => {
      return store.readOne({
        type: 'dogs',
        id: 'dog1'
      })
    })).to.eventually.deep.equal({
      id: 'dog1',
      breed: 'Cocker Spaniel'
    })
  })

  it('readOne when no match found', () => {
    return expect(transaction({ db })(store => {
      return store.readOne({
        type: 'dogs',
        id: 'dog4'
      })
    })).to.be.rejectedWith(NotFound)
  })

  it('readOne by filters', () => {
    return expect(transaction({ db })(store => {
      return store.readOne({
        type: 'dogs',
        filters: {
          breed: 'Cocker Spaniel'
        }
      })
    })).to.eventually.deep.equal({
      id: 'dog1',
      breed: 'Cocker Spaniel'
    })
  })

  it('readOne by filters when no match found', () => {
    return expect(transaction({ db })(store => {
      return store.readOne({
        type: 'dogs',
        filters: {
          breed: 'Chihuahua'
        }
      })
    })).to.be.rejectedWith(NotFound)
  })

  it('readAll', () => {
    return expect(transaction({ db })(store => {
      return store.readAll({
        type: 'dogs'
      })
    })).to.eventually.deep.equal([
      {
        id: 'dog1',
        breed: 'Cocker Spaniel'
      },
      {
        id: 'dog2',
        breed: 'Dalmatian'
      },
      {
        id: 'dog3',
        breed: 'Alsatian'
      }
    ])
  })

  it('readAll by filters', () => {
    return expect(transaction({ db })(store => {
      return store.readAll({
        type: 'dogs',
        filters: {
          breed: 'Cocker Spaniel'
        }
      })
    })).to.eventually.deep.equal([
      {
        id: 'dog1',
        breed: 'Cocker Spaniel'
      }
    ])
  })

  it('readMany', () => {
    return expect(transaction({ db })(store => {
      return store.readMany({
        type: 'dogs',
        ids: ['dog2', 'dog1']
      })
    })).to.eventually.deep.equal([
      {
        id: 'dog2',
        breed: 'Dalmatian'
      },
      {
        id: 'dog1',
        breed: 'Cocker Spaniel'
      }
    ])
  })

  it('readMany when an item not found', () => {
    return expect(transaction({ db })(store => {
      return store.readMany({
        type: 'dogs',
        ids: ['dog2', 'dog4']
      })
    })).to.be.rejectedWith(NotFound)
  })

  it('update', () => {
    return transaction({ db })(store => {
      return store.update({
        type: 'dogs',
        id: 'dog2',
        data: {
          breed: 'Pug'
        }
      })
    })
    .then(result => {
      expect(result).to.deep.equal({
        id: 'dog2',
        breed: 'Pug'
      })
      expect(db.dogs[1]).to.deep.equal({
        id: 'dog2',
        breed: 'Pug'
      })
    })
  })

  it('update when no match', () => {
    return expect(transaction({ db })(store => {
      return store.update({
        type: 'dogs',
        id: 'dog4',
        data: {
          breed: 'Pug'
        }
      })
    })).to.be.rejectedWith(NotFound)
  })

  it('delete', () => {
    return transaction({ db })(store => {
      return store.delete({
        type: 'dogs',
        id: 'dog2'
      })
    })
    .then(result => {
      expect(result).to.deep.equal({
        id: 'dog2',
        breed: 'Dalmatian'
      })
      expect(db.dogs).to.deep.equal([
        {
          id: 'dog1',
          breed: 'Cocker Spaniel'
        },
        {
          id: 'dog3',
          breed: 'Alsatian'
        }
      ])
    })
  })

  it('delete when no match', () => {
    return expect(transaction({ db })(store => {
      return store.delete({
        type: 'dogs',
        id: 'dog4'
      })
    })).to.be.rejectedWith(NotFound)
  })

  it('readOneOrCreate when match found', () => {
    return transaction({ db })(store => {
      return store.readOneOrCreate({
        type: 'dogs',
        filters: {
          breed: 'Dalmatian'
        },
        data: {
          breed: 'Dalmatian'
        }
      })
    })
    .then(result => {
      expect(result).to.have.property('id')
      expect(result).to.have.property('breed').to.equal('Dalmatian')
      expect(db.dogs.length).to.equal(3)
    })
  })

  it('readOneOrCreate when no match found', () => {
    return transaction({ db })(store => {
      return store.readOneOrCreate({
        type: 'dogs',
        filters: {
          breed: 'CavapooFilter'
        },
        data: {
          breed: 'CavapooData'
        }
      })
    })
    .then(result => {
      expect(result).to.have.property('id')
      expect(result).to.have.property('breed').to.equal('CavapooData')
      expect(db.dogs.length).to.equal(4)
      expect(db.dogs[3]).to.have.property('id')
      expect(db.dogs[3]).to.have.property('breed', 'CavapooData')
    })
  })
})
