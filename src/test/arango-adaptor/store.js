/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const isDate = require('date-fns/is_valid')
const differenceInMinutes = require('date-fns/difference_in_minutes')
const expect = chai.expect

chai.use(sinonChai)

const DOCUMENT_RESPONSE = { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' }
const NEW_RESPONSE = { new: { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' } }
const OLD_RESPONSE = { old: { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' } }
const FILTER_NO_MATCH = null

describe.only('ArangoAdaptor Store', () => {
  let Store
  let dbStub

  before(() => {
    dbStub = {
      db: {
        collectionName: {
          save: sinon.stub().returns(NEW_RESPONSE),
          document: sinon.stub(),
          firstExample: sinon.stub().returns(DOCUMENT_RESPONSE),
          all: sinon.stub().returns({ toArray: () => [DOCUMENT_RESPONSE, DOCUMENT_RESPONSE] }),
          byExample: sinon.stub().returns({ toArray: () => [DOCUMENT_RESPONSE, DOCUMENT_RESPONSE] }),
          update: sinon.stub().returns(NEW_RESPONSE),
          remove: sinon.stub().returns(OLD_RESPONSE)
        }
      }
    }
    dbStub.db.collectionName.document.withArgs(123).returns(DOCUMENT_RESPONSE)
    dbStub.db.collectionName.document.returns([DOCUMENT_RESPONSE, DOCUMENT_RESPONSE])
    Store = proxyquire('../../gql/arango-adaptor/store', {
      '@arangodb': dbStub
    })
  })
  afterEach(() => {
    dbStub.db.collectionName.save.reset()
    dbStub.db.collectionName.document.reset()
    dbStub.db.collectionName.firstExample.reset()
    dbStub.db.collectionName.all.reset()
    dbStub.db.collectionName.byExample.reset()
    dbStub.db.collectionName.update.reset()
    dbStub.db.collectionName.remove.reset()
  })

  it('to be an object', () => {
    expect(Store).to.be.an('object')
  })

  describe('create', () => {
    it('should save the data', () => {
      Store.create({
        type: 'collectionName',
        data: {
          prop: 'value'
        }
      })
      const dataArgument = dbStub.db.collectionName.save.firstCall.args[0]
      expect(dataArgument).to.have.property('prop', 'value')
    })

    it('should append created date', () => {
      Store.create({
        type: 'collectionName',
        data: {
          prop: 'value'
        }
      })
      const dataArgument = dbStub.db.collectionName.save.firstCall.args[0]
      expect(dataArgument).to.have.property('created')
      expect(isDate(new Date(dataArgument.created)), 'Created is not date').to.be.true()
      expect(differenceInMinutes(new Date(dataArgument.created), new Date()) < 1, 'Created is not recent date').to.be.true()
    })

    it('should append modified date', () => {
      Store.create({
        type: 'collectionName',
        data: {
          prop: 'value'
        }
      })
      const dataArgument = dbStub.db.collectionName.save.firstCall.args[0]
      expect(dataArgument).to.have.property('modified')
      expect(isDate(new Date(dataArgument.modified)), 'Modified is not date').to.be.true()
      expect(differenceInMinutes(new Date(dataArgument.modified), new Date()) < 1, 'Modified is not recent date').to.be.true()
    })

    it('should request newly created entity is returned', () => {
      Store.create({
        type: 'collectionName',
        data: {
          prop: 'value'
        }
      })
      const optionsArgument = dbStub.db.collectionName.save.firstCall.args[1]
      expect(optionsArgument).to.have.property('returnNew', true)
    })

    it('should return normalised entity', () => {
      expect(Store.create({
        type: 'collectionName',
        data: {
          prop: 'value'
        }
      })).to.deep.equal({
        id: 'id',
        prop: 'value'
      })
    })
  })

  describe('readOne', () => {
    describe('by id', () => {
      it('should read the data by id', () => {
        Store.readOne({
          type: 'collectionName',
          id: 123
        })
        const dataArgument = dbStub.db.collectionName.document.firstCall.args[0]
        expect(dataArgument).to.equal(123)
      })

      it('should return normalised entity', () => {
        expect(Store.readOne({
          type: 'collectionName',
          id: 123
        })).to.deep.equal({
          id: 'id',
          prop: 'value'
        })
      })
    })

    describe('by filters', () => {
      it('should read the data by filters', () => {
        Store.readOne({
          type: 'collectionName',
          filters: {
            test: 'value'
          }
        })
        const dataArgument = dbStub.db.collectionName.firstExample.firstCall.args[0]
        expect(dataArgument).to.deep.equal({
          test: 'value'
        })
      })

      it('should return normalised entity', () => {
        expect(Store.readOne({
          type: 'collectionName',
          filters: {
            test: 'value'
          }
        })).to.deep.equal({
          id: 'id',
          prop: 'value'
        })
      })
    })
  })

  describe('readMany', () => {
    it('should read the data by ids', () => {
      Store.readMany({
        type: 'collectionName',
        ids: [1, 2]
      })
      const dataArgument = dbStub.db.collectionName.document.firstCall.args[0]
      expect(dataArgument).to.deep.equal([1, 2])
    })

    it('should return normalised entities', () => {
      expect(Store.readMany({
        type: 'collectionName',
        ids: [1, 2]
      })).to.deep.equal([{
        id: 'id',
        prop: 'value'
      }, {
        id: 'id',
        prop: 'value'
      }])
    })
  })

  describe('readAll', () => {
    describe('with no filters', () => {
      it('should fetch the data', () => {
        Store.readAll({
          type: 'collectionName'
        })
        expect(dbStub.db.collectionName.all).to.have.been.called()
      })

      it('should return normalised entities', () => {
        expect(Store.readAll({
          type: 'collectionName'
        })).to.deep.equal([{
          id: 'id',
          prop: 'value'
        }, {
          id: 'id',
          prop: 'value'
        }])
      })
    })

    describe('with filters', () => {
      it('should fetch the data', () => {
        Store.readAll({
          type: 'collectionName',
          filters: {
            test: 'value'
          }
        })
        const dataArgument = dbStub.db.collectionName.byExample.firstCall.args[0]
        expect(dataArgument).to.deep.equal({
          test: 'value'
        })
      })

      it('should return normalised entities', () => {
        expect(Store.readAll({
          type: 'collectionName',
          filters: {
            test: 'value'
          }
        })).to.deep.equal([{
          id: 'id',
          prop: 'value'
        }, {
          id: 'id',
          prop: 'value'
        }])
      })
    })
  })

  describe('update', () => {
    it('should pass the entity id', () => {
      Store.update({
        type: 'collectionName',
        id: 456,
        data: {
          prop: 'value'
        }
      })
      const id = dbStub.db.collectionName.update.firstCall.args[0]
      expect(id).to.equal(456)
    })

    it('should pass the patch data', () => {
      Store.update({
        type: 'collectionName',
        id: 456,
        data: {
          prop: 'value'
        }
      })
      const dataArgument = dbStub.db.collectionName.update.firstCall.args[1]
      expect(dataArgument).to.have.property('prop', 'value')
    })

    it('should append modified date', () => {
      Store.update({
        type: 'collectionName',
        id: 456,
        data: {
          prop: 'value'
        }
      })
      const dataArgument = dbStub.db.collectionName.update.firstCall.args[1]
      expect(dataArgument).to.have.property('modified')
      expect(isDate(new Date(dataArgument.modified)), 'Modified is not date').to.be.true()
      expect(differenceInMinutes(new Date(dataArgument.modified), new Date()) < 1, 'Modified is not recent date').to.be.true()
    })

    it('should request updated entity is returned', () => {
      Store.update({
        type: 'collectionName',
        id: 456,
        data: {
          prop: 'value'
        }
      })
      const optionsArgument = dbStub.db.collectionName.update.firstCall.args[2]
      expect(optionsArgument).to.have.property('returnNew', true)
    })

    it('should return normalised entity', () => {
      expect(Store.update({
        type: 'collectionName',
        id: 456,
        data: {
          prop: 'value'
        }
      })).to.deep.equal({
        id: 'id',
        prop: 'value'
      })
    })
  })

  describe('delete', () => {
    it('should pass the entity id', () => {
      Store.delete({
        type: 'collectionName',
        id: 456
      })
      const id = dbStub.db.collectionName.remove.firstCall.args[0]
      expect(id).to.equal(456)
    })

    it('should request deleted entity is returned', () => {
      Store.delete({
        type: 'collectionName',
        id: 456
      })
      const optionsArgument = dbStub.db.collectionName.remove.firstCall.args[1]
      expect(optionsArgument).to.have.property('returnOld', true)
    })

    it('should return normalised entity', () => {
      expect(Store.delete({
        type: 'collectionName',
        id: 456
      })).to.deep.equal({
        id: 'id',
        prop: 'value'
      })
    })
  })

  describe('readOneOrCreate', () => {
    describe('if filter finds a match', () => {
      it('checks for existing', () => {
        Store.readOneOrCreate({
          type: 'collectionName',
          filters: {
            test: 'value'
          },
          data: {
            key: 'value'
          }
        })
        const dataArgument = dbStub.db.collectionName.firstExample.firstCall.args[0]
        expect(dataArgument).to.have.property('test', 'value')
        expect(dbStub.db.collectionName.save).to.not.have.been.called()
      })

      it('should return existing entity', () => {
        expect(Store.readOneOrCreate({
          type: 'collectionName',
          filters: {
            test: 'value'
          },
          data: {
            key: 'value'
          }
        })).to.deep.equal({
          id: 'id',
          prop: 'value'
        })
      })
    })

    describe('if filter matches nothing', () => {
      beforeEach(() => {
        dbStub.db.collectionName.firstExample.returns(FILTER_NO_MATCH)
      })

      it('should save the data', () => {
        Store.readOneOrCreate({
          type: 'collectionName',
          filters: {
            test: 'value'
          },
          data: {
            prop: 'value'
          }
        })
        const dataArgument = dbStub.db.collectionName.save.firstCall.args[0]
        expect(dataArgument).to.have.property('prop', 'value')
      })

      it('should append created date', () => {
        Store.readOneOrCreate({
          type: 'collectionName',
          filters: {
            test: 'value'
          },
          data: {
            prop: 'value'
          }
        })
        const dataArgument = dbStub.db.collectionName.save.firstCall.args[0]
        expect(dataArgument).to.have.property('created')
        expect(isDate(new Date(dataArgument.created)), 'Created is not date').to.be.true()
        expect(differenceInMinutes(new Date(dataArgument.created), new Date()) < 1, 'Created is not recent date').to.be.true()
      })

      it('should append modified date', () => {
        Store.readOneOrCreate({
          type: 'collectionName',
          filters: {
            test: 'value'
          },
          data: {
            prop: 'value'
          }
        })
        const dataArgument = dbStub.db.collectionName.save.firstCall.args[0]
        expect(dataArgument).to.have.property('modified')
        expect(isDate(new Date(dataArgument.modified)), 'Modified is not date').to.be.true()
        expect(differenceInMinutes(new Date(dataArgument.modified), new Date()) < 1, 'Modified is not recent date').to.be.true()
      })

      it('should request newly created entity is returned', () => {
        Store.readOneOrCreate({
          type: 'collectionName',
          filters: {
            test: 'value'
          },
          data: {
            prop: 'value'
          }
        })
        const optionsArgument = dbStub.db.collectionName.save.firstCall.args[1]
        expect(optionsArgument).to.have.property('returnNew', true)
      })

      it('should return normalised entity', () => {
        expect(Store.readOneOrCreate({
          type: 'collectionName',
          filters: {
            test: 'value'
          },
          data: {
            prop: 'value'
          }
        })).to.deep.equal({
          id: 'id',
          prop: 'value'
        })
      })
    })
  })
})
