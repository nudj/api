/* eslint-env mocha */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { NotFound } = require('@nudj/library/errors')
const expect = chai.expect

chai.use(chaiAsPromised)

const transaction = require('../../../gql/adaptors/lodash')

describe.only('LodashAdaptor transaction', () => {
  let db

  beforeEach(() => {
    db = {
      dogs: [
        {
          id: 'dog1',
          breed: 'Cocker Spaniel',
          firstName: 'Patches',
          lastName: 'McDoggo'
        },
        {
          id: 'dog2',
          breed: 'Dalmatian',
          firstName: 'Spots',
          lastName: 'McDoggo'
        },
        {
          id: 'dog3',
          breed: 'Golden Retriever',
          firstName: 'Fluffy',
          lastName: 'Von Tailwags'
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
      breed: 'Cocker Spaniel',
      firstName: 'Patches',
      lastName: 'McDoggo'
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
      breed: 'Cocker Spaniel',
      firstName: 'Patches',
      lastName: 'McDoggo'
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
    })).to.eventually.deep.equal(db.dogs)
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
        breed: 'Cocker Spaniel',
        firstName: 'Patches',
        lastName: 'McDoggo'
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
        breed: 'Dalmatian',
        firstName: 'Spots',
        lastName: 'McDoggo'
      },
      {
        id: 'dog1',
        breed: 'Cocker Spaniel',
        firstName: 'Patches',
        lastName: 'McDoggo'
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
          breed: 'Pug',
          firstName: 'Puppers',
          lastName: 'O\'Woofer'
        }
      })
    })
    .then(result => {
      expect(result).to.deep.equal({
        id: 'dog2',
        breed: 'Pug',
        firstName: 'Puppers',
        lastName: 'O\'Woofer'
      })
      expect(db.dogs[1]).to.deep.equal({
        id: 'dog2',
        breed: 'Pug',
        firstName: 'Puppers',
        lastName: 'O\'Woofer'
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
        breed: 'Dalmatian',
        firstName: 'Spots',
        lastName: 'McDoggo'
      })
      expect(db.dogs).to.deep.equal([
        {
          id: 'dog1',
          breed: 'Cocker Spaniel',
          firstName: 'Patches',
          lastName: 'McDoggo'
        },
        {
          id: 'dog3',
          breed: 'Golden Retriever',
          firstName: 'Fluffy',
          lastName: 'Von Tailwags'
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

  it('search', () => {
    return transaction({ db })(store => {
      return store.search({
        type: 'dogs',
        query: 'McDoggo'
      })
    })
    .then(result => {
      expect(result).to.deep.equal([
        {
          id: 'dog1',
          breed: 'Cocker Spaniel',
          firstName: 'Patches',
          lastName: 'McDoggo'
        },
        {
          id: 'dog2',
          breed: 'Dalmatian',
          firstName: 'Spots',
          lastName: 'McDoggo'
        }
      ])
    })
  })

  it('search with incomplete query', () => {
    return transaction({ db })(store => {
      return store.search({
        type: 'dogs',
        query: 'Pat'
      })
    })
    .then(result => {
      expect(result).to.deep.equal([
        {
          id: 'dog1',
          breed: 'Cocker Spaniel',
          firstName: 'Patches',
          lastName: 'McDoggo'
        }
      ])
    })
  })

  it('search with multiple words', () => {
    return transaction({ db })(store => {
      return store.search({
        type: 'dogs',
        query: 'Fluffy Von tailwags'
      })
    })
    .then(result => {
      expect(result).to.deep.equal([
        {
          id: 'dog3',
          breed: 'Golden Retriever',
          firstName: 'Fluffy',
          lastName: 'Von Tailwags'
        }
      ])
    })
  })
})
