/* eslint-env mocha */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { NotFound } = require('@nudj/library/errors')
const expect = chai.expect

chai.use(chaiAsPromised)

const { transaction } = require('../../../gql/adaptors/lodash')

describe('LodashAdaptor transaction', () => {
  let db

  beforeEach(() => {
    db = {
      dogs: [
        {
          id: 'dog1',
          breed: 'Cocker Spaniel',
          temperament: 'gentle'
        },
        {
          id: 'dog2',
          breed: 'Dalmatian',
          temperament: 'good boy'
        },
        {
          id: 'dog3',
          breed: 'Golden Retriever',
          temperament: 'lazy'
        }
      ],
      monsters: [
        {
          name: 'Frankenstein',
          type: 'classic',
          created: '1986-07-06T07:34:54.000'
        },
        {
          name: 'Dracula',
          type: 'classic',
          created: '1986-07-07T07:34:54.000'
        },
        {
          name: 'Jason Voorhees',
          type: 'modern',
          created: '1986-07-08T07:34:54.000'
        },
        {
          name: 'Loch Ness Monster',
          type: 'mythological',
          created: '1986-07-09T07:34:54.000'
        },
        {
          name: 'Gremlin',
          type: 'modern',
          created: '1986-07-10T07:34:54.000'
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
      temperament: 'gentle'
    })
  })

  it('readOne when no match found', () => {
    return expect(transaction({ db })(store => {
      return store.readOne({
        type: 'dogs',
        id: 'dog4'
      })
    })).to.eventually.equal(null)
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
      temperament: 'gentle'
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
    })).to.eventually.equal(null)
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
        temperament: 'gentle'
      }
    ])
  })

  it('readAll by dateTo filter', () => {
    return expect(transaction({ db })(store => {
      return store.readAll({
        type: 'monsters',
        filters: {
          dateTo: '1986-07-08T07:34:54.000'
        }
      })
    })).to.eventually.deep.equal([
      {
        name: 'Frankenstein',
        type: 'classic',
        created: '1986-07-06T07:34:54.000'
      },
      {
        name: 'Dracula',
        type: 'classic',
        created: '1986-07-07T07:34:54.000'
      },
      {
        name: 'Jason Voorhees',
        type: 'modern',
        created: '1986-07-08T07:34:54.000'
      }
    ])
  })

  it('readAll by dateFrom filter', () => {
    return expect(transaction({ db })(store => {
      return store.readAll({
        type: 'monsters',
        filters: {
          dateFrom: '1986-07-08T07:34:54.000'
        }
      })
    })).to.eventually.deep.equal([
      {
        name: 'Jason Voorhees',
        type: 'modern',
        created: '1986-07-08T07:34:54.000'
      },
      {
        name: 'Loch Ness Monster',
        type: 'mythological',
        created: '1986-07-09T07:34:54.000'
      },
      {
        name: 'Gremlin',
        type: 'modern',
        created: '1986-07-10T07:34:54.000'
      }
    ])
  })

  it('readAll by combined date filters', () => {
    return expect(transaction({ db })(store => {
      return store.readAll({
        type: 'monsters',
        filters: {
          dateTo: '1986-07-08T07:34:54.000',
          dateFrom: '1986-07-07T07:34:54.000'
        }
      })
    })).to.eventually.deep.equal([
      {
        name: 'Dracula',
        type: 'classic',
        created: '1986-07-07T07:34:54.000'
      },
      {
        created: '1986-07-08T07:34:54.000',
        name: 'Jason Voorhees',
        type: 'modern'
      }
    ])
  })

  it('readAll by combined date filters', () => {
    return expect(transaction({ db })(store => {
      return store.readAll({
        type: 'monsters',
        filters: {
          dateTo: '1986-07-07T07:34:54.000',
          dateFrom: '1986-07-06T07:34:54.000',
          type: 'classic'
        }
      })
    })).to.eventually.deep.equal([
      {
        name: 'Frankenstein',
        type: 'classic',
        created: '1986-07-06T07:34:54.000'
      },
      {
        name: 'Dracula',
        type: 'classic',
        created: '1986-07-07T07:34:54.000'
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
        temperament: 'good boy'
      },
      {
        id: 'dog1',
        breed: 'Cocker Spaniel',
        temperament: 'gentle'
      }
    ])
  })

  it('readMany when an item not found', () => {
    return expect(transaction({ db })(store => {
      return store.readMany({
        type: 'dogs',
        ids: ['dog2', 'dog4']
      })
    })).to.eventually.deep.equal([])
  })

  it('update', () => {
    return transaction({ db })(store => {
      return store.update({
        type: 'dogs',
        id: 'dog2',
        data: {
          breed: 'Pug',
          temperament: 'Puppers O\'Woofer'
        }
      })
    })
    .then(result => {
      expect(result).to.deep.equal({
        id: 'dog2',
        breed: 'Pug',
        temperament: 'Puppers O\'Woofer'
      })
      expect(db.dogs[1]).to.deep.equal({
        id: 'dog2',
        breed: 'Pug',
        temperament: 'Puppers O\'Woofer'
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
        temperament: 'good boy'
      })
      expect(db.dogs).to.deep.equal([
        {
          id: 'dog1',
          breed: 'Cocker Spaniel',
          temperament: 'gentle'
        },
        {
          id: 'dog3',
          breed: 'Golden Retriever',
          temperament: 'lazy'
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
        query: 'gentle',
        fields: [
          ['temperament']
        ]
      })
    })
    .then(result => {
      expect(result).to.deep.equal([
        {
          id: 'dog1',
          breed: 'Cocker Spaniel',
          temperament: 'gentle'
        }
      ])
    })
  })

  it('search with multiple fields', () => {
    return transaction({ db })(store => {
      return store.search({
        type: 'dogs',
        query: 'Go',
        fields: [
          ['temperament'],
          ['breed']
        ]
      })
    })
    .then(result => {
      expect(result).to.deep.equal([
        {
          id: 'dog2',
          breed: 'Dalmatian',
          temperament: 'good boy'
        },
        {
          id: 'dog3',
          breed: 'Golden Retriever',
          temperament: 'lazy'
        }
      ])
    })
  })

  it('search with incomplete query', () => {
    return transaction({ db })(store => {
      return store.search({
        type: 'dogs',
        query: 'az',
        fields: [
          ['temperament']
        ]
      })
    })
    .then(result => {
      expect(result).to.deep.equal([
        {
          id: 'dog3',
          breed: 'Golden Retriever',
          temperament: 'lazy'
        }
      ])
    })
  })

  it('search with joined fields', () => {
    return transaction({ db })(store => {
      return store.search({
        type: 'dogs',
        query: 'lazy golden',
        fields: [
          ['temperament', 'breed']
        ]
      })
    })
    .then(result => {
      expect(result).to.deep.equal([
        {
          id: 'dog3',
          breed: 'Golden Retriever',
          temperament: 'lazy'
        }
      ])
    })
  })

  it('search with joined fields matching only one field', () => {
    return transaction({ db })(store => {
      return store.search({
        type: 'dogs',
        query: 'gold',
        fields: [
          ['temperament', 'breed']
        ]
      })
    })
    .then(result => {
      expect(result).to.deep.equal([
        {
          id: 'dog3',
          breed: 'Golden Retriever',
          temperament: 'lazy'
        }
      ])
    })
  })

  it('search with filters', () => {
    return transaction({ db })(store => {
      return store.search({
        type: 'dogs',
        query: 'o',
        fields: [
          ['breed']
        ],
        filters: {
          temperament: 'lazy'
        }
      })
    })
    .then(result => {
      expect(result).to.deep.equal([
        {
          id: 'dog3',
          breed: 'Golden Retriever',
          temperament: 'lazy'
        }
      ])
    })
  })
})
