/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const sinon = require('sinon')
const qs = require('qs')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')

const mailerStub = sinon.stub()

describe('AccessRequest.accept', () => {
  let operation
  let db

  before(() => {
    nock('https://api.mailgun.net')
      .persist()
      .filteringRequestBody(body => {
        mailerStub(qs.parse(body))
        return true
      })
      .post(() => true)
      .reply(200, 'OK')
  })

  beforeEach(() => {
    operation = `
      mutation {
        accessRequest (
          id: "accessRequest1"
        ) {
          accept
        }
      }
    `
    db = {
      companies: [
        {
          id: 'company1',
          name: 'Company One'
        }
      ],
      people: [
        {
          id: 'person1',
          firstName: 'Andrew',
          lastName: 'Admin'
        },
        {
          id: 'person2',
          firstName: 'Madelyn',
          lastName: 'Member',
          email: 'madelyn@email.tld'
        }
      ],
      hirers: [
        {
          id: 'hirer1',
          person: 'person1',
          company: 'company1',
          type: hirerTypes.ADMIN
        }
      ],
      accessRequests: [
        {
          id: 'accessRequest1',
          company: 'company1',
          person: 'person2'
        }
      ],
      acceptedAccessRequests: []
    }
  })

  afterEach(() => {
    mailerStub.reset()
  })

  after(() => {
    nock.cleanAll()
  })

  describe('on green path', () => {
    it('should create new member hirer', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.hirers).to.have.length(2)
      expect(db.hirers[1]).to.have.property('company', 'company1')
      expect(db.hirers[1]).to.have.property('person', 'person2')
      expect(db.hirers[1]).to.have.property('type', hirerTypes.MEMBER)
      expect(db.hirers[1]).to.have.property('onboarded', false)
    })

    it('should create new acceptedAccessRequest', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.acceptedAccessRequests).to.have.length(1)
      expect(db.acceptedAccessRequests[0]).to.have.property('accessRequest', 'accessRequest1')
      expect(db.acceptedAccessRequests[0]).to.have.property('hirer', 'hirer1')
    })

    it('should email the new hirer with acceptance email', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(mailerStub).to.have.been.calledOnce()
      const mailgunArgs = mailerStub.args[0][0]
      expect(mailgunArgs).to.have.property('to', 'madelyn@email.tld')
      expect(mailgunArgs).to.have.property('subject', `Andrew Admin has accepted your request`)
      expect(mailgunArgs).to.have.property('html')
    })

    it('should return true', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(result).to.have.deep.property('data.accessRequest.accept', true)
    })
  })

  describe('when request has already been accepted', () => {
    beforeEach(() => {
      db.acceptedAccessRequests[0] = {
        accessRequest: 'accessRequest1',
        hirer: 'hirer1'
      }
    })
    it('should not create new hirer', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.hirers).to.have.length(1)
    })

    it('should not create new acceptedAccessRequest', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.acceptedAccessRequests).to.have.length(1)
    })

    it('should not email the new hirer with acceptance email', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(mailerStub).to.not.have.been.called()
    })

    it('should return null', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(result).to.have.deep.property('data.accessRequest.accept', null)
    })
  })

  describe('when accepting hirer is not an ADMIN', () => {
    beforeEach(() => {
      db.hirers[0].type = hirerTypes.MEMBER
    })
    it('should not create new hirer', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.hirers).to.have.length(1)
    })

    it('should not create new acceptedAccessRequest', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.acceptedAccessRequests).to.have.length(0)
    })

    it('should not email the new hirer with acceptance email', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(mailerStub).to.not.have.been.called()
    })

    it('should return null', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(result).to.have.deep.property('data.accessRequest.accept', null)
    })
  })
})
