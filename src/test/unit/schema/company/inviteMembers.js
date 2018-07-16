/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const sinon = require('sinon')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

describe('Company.inviteMembers', () => {
  const mailerStub = sinon.stub()
  const operation = `
    query ($emailAddresses: [String!]!) {
      company (id: "company1") {
        inviteMembers(emailAddresses: $emailAddresses) {
          success
        }
      }
    }
  `
  const variables = {
    emailAddresses: [
      'tim@nudj.co',
      'jim@nudj.co',
      'jamie@nudj.co'
    ]
  }

  before(() => {
    nock('https://api.mailgun.net')
      .persist()
      .filteringRequestBody(body => {
        mailerStub(body)
        return true
      })
      .post(() => true)
      .reply(200, 'OK')
  })

  beforeEach(() => {
    nock('https://api.intercom.io')
      .persist()
      .filteringRequestBody(() => true)
      .get(() => true)
      .reply(200, { name: 'COMPANY', company_id: 'COMPANY' })

    nock('https://api.intercom.io')
      .persist()
      .filteringRequestBody(() => true)
      .post(() => true)
      .reply(200, { tags: { tags: [] } })
  })

  after(() => {
    nock.cleanAll()
  })

  afterEach(() => {
    mailerStub.reset()
  })

  it('should send an invite', async () => {
    const db = {
      companies: [
        {
          id: 'company1',
          name: 'Fake Company'
        }
      ],
      hirers: [],
      people: [
        {
          id: 'person1',
          firstName: 'David',
          lastName: 'Platt'
        }
      ]
    }

    await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

    expect(mailerStub).to.have.been.called()
    expect(mailerStub.callCount).to.equal(3)
  })

  it('should not send duplicate invites', async () => {
    const db = {
      companies: [
        {
          id: 'company1',
          name: 'Fake Company'
        }
      ],
      hirers: [],
      people: [
        {
          id: 'person1',
          firstName: 'David',
          lastName: 'Platt'
        }
      ]
    }
    const variables = {
      emailAddresses: [
        'jim@nudj.co',
        'jim@nudj.co',
        'rich@nudj.co'
      ]
    }

    await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

    expect(mailerStub).to.have.been.called()
    expect(mailerStub.callCount).to.equal(2)
  })

  it('should return with success status', async () => {
    const db = {
      companies: [
        {
          id: 'company1',
          name: 'Fake Company'
        }
      ],
      hirers: [],
      people: [
        {
          id: 'person1',
          firstName: 'David',
          lastName: 'Platt'
        }
      ]
    }

    const { data } = await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

    expect(data.company).to.deep.equal({
      inviteMembers: {
        success: true
      }
    })
  })

  describe('when the person is already a hirer of another company', () => {
    it('should throw an error and notify nudj if the hirer is with a different company', async () => {
      const db = {
        companies: [
          {
            id: 'company1',
            name: 'Umbrella Corporation'
          }
        ],
        hirers: [
          {
            id: 'hirer1',
            person: 'person2',
            company: 'company3'
          }
        ],
        people: [
          {
            id: 'person1',
            firstName: 'David',
            lastName: 'Platt'
          },
          {
            id: 'person2',
            firstName: 'Tim',
            lastName: 'Robinson',
            email: 'tim@nudj.co'
          }
        ]
      }

      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      const notifyEmailBody = decodeURI(mailerStub.getCall(0).args)

      expect(notifyEmailBody).to.include('subject=Teammate invitation failed')
      expect(notifyEmailBody).to.include('html=A hirer for Umbrella Corporation attempted to add a teammate')
      expect(mailerStub.callCount).to.equal(1)
      shouldRespondWithGqlError({
        path: ['company', 'inviteMembers']
      })(result)
    })
  })

  it('should throw error if no emails are provided', async () => {
    const db = {
      companies: [
        {
          id: 'company1',
          name: 'Fake Company'
        }
      ],
      hirers: [],
      people: [
        {
          id: 'person1',
          firstName: 'David',
          lastName: 'Platt'
        }
      ]
    }
    const variables = {
      emailAddresses: []
    }

    const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

    shouldRespondWithGqlError({
      path: ['company', 'inviteMembers']
    })(result)
  })
})
