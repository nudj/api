/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const sinon = require('sinon')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

describe('Company.sendJobEmails', () => {
  const mailerStub = sinon.stub()
  const operation = `
    query ($recipients: [ID!]!, $jobs: [ID!]!) {
      company (id: "company1") {
        sendJobEmails(recipients: $recipients, jobs: $jobs) {
          success
        }
      }
    }
  `
  const variables = {
    recipients: [
      'person2',
      'person3',
      'person4'
    ],
    jobs: [
      'job1',
      'job2',
      'job3'
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

  after(() => {
    nock.cleanAll()
  })

  afterEach(() => {
    mailerStub.reset()
  })

  it('should send an email to the provided teammates', async () => {
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
        },
        {
          id: 'person2',
          email: 'donna@tardis.tld'
        },
        {
          id: 'person3',
          email: 'picard@enterprise.tld'
        },
        {
          id: 'person4',
          email: 'shepard@normandy.tld'
        }
      ],
      jobs: []
    }

    await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

    expect(mailerStub).to.have.been.called()
    expect(mailerStub.callCount).to.equal(3)
  })

  it('should not send duplicate emails', async () => {
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
        },
        {
          id: 'person2',
          email: 'donna@tardis.tld'
        },
        {
          id: 'person3',
          email: 'picard@enterprise.tld'
        },
        {
          id: 'person4',
          email: 'shepard@normandy.tld'
        }
      ],
      jobs: []
    }
    const variables = {
      recipients: [
        'person2',
        'person2',
        'person4'
      ],
      jobs: [
        'job1',
        'job2',
        'job3'
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
        },
        {
          id: 'person2',
          email: 'donna@tardis.tld'
        },
        {
          id: 'person3',
          email: 'picard@enterprise.tld'
        },
        {
          id: 'person4',
          email: 'shepard@normandy.tld'
        }
      ],
      jobs: []
    }

    const { data } = await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

    expect(data.company).to.deep.equal({
      sendJobEmails: {
        success: true
      }
    })
  })

  it('should throw error if no recipient IDs are provided', async () => {
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
        },
        {
          id: 'person2',
          email: 'donna@tardis.tld'
        },
        {
          id: 'person3',
          email: 'picard@enterprise.tld'
        },
        {
          id: 'person4',
          email: 'shepard@normandy.tld'
        }
      ],
      jobs: []
    }
    const variables = {
      recipients: [],
      jobs: [
        'job1',
        'job2',
        'job3'
      ]
    }

    const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

    shouldRespondWithGqlError({
      path: ['company', 'sendJobEmails']
    })(result)
  })

  it('should throw error if no job IDs are provided', async () => {
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
        },
        {
          id: 'person2',
          email: 'donna@tardis.tld'
        },
        {
          id: 'person3',
          email: 'picard@enterprise.tld'
        },
        {
          id: 'person4',
          email: 'shepard@normandy.tld'
        }
      ],
      jobs: []
    }
    const variables = {
      recipients: [
        'person2',
        'person3',
        'person4'
      ],
      jobs: []
    }

    const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

    shouldRespondWithGqlError({
      path: ['company', 'sendJobEmails']
    })(result)
  })
})
