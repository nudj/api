/* eslint-env mocha */

const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const isDate = require('date-fns/is_valid')
const differenceInMinutes = require('date-fns/difference_in_minutes')
const expect = chai.expect

chai.use(sinonChai)

const NEW_RESPONSE = { new: { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' } }

describe('ArangoAdaptor Store().create', () => {
  let Store
  let dbStub

  before(() => {
    dbStub = {
      db: {
        collectionName: {
          save: sinon.stub().returns(NEW_RESPONSE)
        }
      }
    }
    Store = proxyquire('../../../gql/adaptors/arango/store', {
      '@arangodb': dbStub
    })
  })
  afterEach(() => {
    dbStub.db.collectionName.save.reset()
  })

  it('should save the data', () => {
    return Store().create({
      type: 'collectionName',
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const dataArgument = dbStub.db.collectionName.save.firstCall.args[0]
      expect(dataArgument).to.have.property('prop', 'value')
    })
  })

  it('should append created date', () => {
    return Store().create({
      type: 'collectionName',
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const dataArgument = dbStub.db.collectionName.save.firstCall.args[0]
      expect(dataArgument).to.have.property('created')
      expect(isDate(new Date(dataArgument.created)), 'Created is not date').to.be.true()
      expect(differenceInMinutes(new Date(dataArgument.created), new Date()) < 1, 'Created is not recent date').to.be.true()
    })
  })

  it('should append modified date', () => {
    return Store().create({
      type: 'collectionName',
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const dataArgument = dbStub.db.collectionName.save.firstCall.args[0]
      expect(dataArgument).to.have.property('modified')
      expect(isDate(new Date(dataArgument.modified)), 'Modified is not date').to.be.true()
      expect(differenceInMinutes(new Date(dataArgument.modified), new Date()) < 1, 'Modified is not recent date').to.be.true()
    })
  })

  it('should request newly created entity is returned', () => {
    return Store().create({
      type: 'collectionName',
      data: {
        prop: 'value'
      }
    })
    .then(() => {
      const optionsArgument = dbStub.db.collectionName.save.firstCall.args[1]
      expect(optionsArgument).to.have.property('returnNew', true)
    })
  })

  it('should return normalised entity', () => {
    return Store().create({
      type: 'collectionName',
      data: {
        prop: 'value'
      }
    })
    .then(result => expect(result).to.deep.equal({
      id: 'id',
      prop: 'value'
    }))
  })
})
