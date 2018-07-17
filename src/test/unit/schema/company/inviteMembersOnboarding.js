/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const sinon = require('sinon')
const qs = require('qs')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

describe('Company.inviteMembersOnboarding', () => {
  const mailerStub = sinon.stub()
  const operation = `
    query (
      $members: [InviteMemberPersonInput!]!,
      $subject: String!,
      $emailBody: String!
    ) {
      company (id: "company1") {
        inviteMembersOnboarding(
          members: $members,
          subject: $subject,
          body: $emailBody
        ) {
          success
        }
      }
    }
  `
  const variables = {
    members: [
      {
        firstName: 'Tim',
        email: 'tim@nudj.co'
      },
      {
        firstName: 'Jim',
        email: 'jim@nudj.co'
      },
      {
        firstName: 'Jamie',
        email: 'jamie@nudj.co'
      }
    ],
    subject: 'Looking to hire a {{job.title}}',
    emailBody: 'Hey {{firstName}}, I am the best email body you have ever seen.'
  }

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

  it('sends an invite', async () => {
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
      ],
      jobs: [
        {
          id: 'job1',
          company: 'company1',
          title: 'Epic Employee',
          bonus: '¥13'
        }
      ]
    }

    await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

    expect(mailerStub).to.have.been.called()
    expect(mailerStub.callCount).to.equal(3)
  })

  it('does not send duplicate invites', async () => {
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
      ],
      jobs: [
        {
          id: 'job1',
          company: 'company1',
          title: 'Epic Employee',
          bonus: '¥13'
        }
      ]
    }
    const variables = {
      members: [
        {
          firstName: 'Tim',
          email: 'tim@nudj.co'
        },
        {
          firstName: 'Jim',
          email: 'jim@nudj.co'
        },
        {
          firstName: 'Evil Tim',
          email: 'tim@nudj.co'
        }
      ],
      subject: 'Looking to hire a {{job.title}}',
      emailBody: 'Hey {{firstName}}, I am the best email body you have ever seen.'
    }

    await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

    expect(mailerStub).to.have.been.called()
    expect(mailerStub.callCount).to.equal(2)
    expect(mailerStub.args[0][0]).to.have.property('to').to.equal('tim@nudj.co')
    expect(mailerStub.args[1][0]).to.have.property('to').to.equal('jim@nudj.co')
  })

  it('renders the subject and message templates with data', async () => {
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
      ],
      jobs: [
        {
          id: 'job1',
          company: 'company1',
          title: 'mad scientist',
          bonus: '¥13'
        }
      ]
    }
    const variables = {
      members: [
        {
          firstName: 'Gavin',
          email: 'gavin@nudj.co'
        }
      ],
      subject: 'Looking to hire a {{job.title}}',
      emailBody: 'Hey {{firstName}}, I am the best email body you have ever seen.'
    }

    await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

    const [ firstArg ] = mailerStub.args[0]

    expect(mailerStub).to.have.been.called()
    expect(mailerStub.callCount).to.equal(1)
    expect(firstArg).to.have.property('subject').to.equal(
      'Looking to hire a mad scientist'
    )
    expect(firstArg).to.have.property('html').to.equal(
      '<p>Hey Gavin, I am the best email body you have ever seen.</p>'
    )
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
      ],
      jobs: [
        {
          id: 'job1',
          company: 'company1',
          title: 'mad scientist',
          bonus: '¥13'
        }
      ]
    }

    const { data } = await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

    expect(data.company).to.deep.equal({
      inviteMembersOnboarding: {
        success: true
      }
    })
  })

  describe('when the person is already a hirer', () => {
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
            firstName: 'Alreadí',
            lastName: 'A. Hyrer',
            email: 'tim@nudj.co'
          }
        ],
        jobs: [
          {
            id: 'job1',
            company: 'company1',
            title: 'mad scientist',
            bonus: '¥13'
          }
        ]
      }

      const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
      const [ firstCall ] = mailerStub.args[0]

      expect(firstCall.subject).to.include('Teammate invitation failed')
      expect(firstCall.html).to.include('A hirer for Umbrella Corporation attempted to add a teammate')
      expect(mailerStub.callCount).to.equal(1)
      shouldRespondWithGqlError({
        path: ['company', 'inviteMembersOnboarding']
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
      ],
      jobs: [
        {
          id: 'job1',
          company: 'company1',
          title: 'mad scientist',
          bonus: '¥13'
        }
      ]
    }
    const variables = {
      members: [],
      subject: 'Looking to hire a {{job.title}}',
      emailBody: 'Hey {{firstName}}.'
    }

    const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })

    shouldRespondWithGqlError({
      path: ['company', 'inviteMembersOnboarding']
    })(result)
  })
})
