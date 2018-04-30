/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const sinon = require('sinon')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')
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
    nock.disableNetConnect() // Disable all external interactions
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
    nock.enableNetConnect()
    nock.cleanAll()
  })

  afterEach(() => {
    mailerStub.reset()
  })

  it('should send an invite', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      hirers: [],
      people: []
    }

    await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

    expect(mailerStub).to.have.been.called()
    expect(mailerStub.callCount).to.equal(3)
  })

  it('should return with success status', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      hirers: [],
      people: []
    }

    const { data } = await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

    expect(data.company).to.deep.equal({
      inviteMembers: {
        success: true
      }
    })
  })

  describe('when the person exists', () => {
    it('should not create a person', async () => {
      const db = {
        companies: [
          {
            id: 'company1'
          }
        ],
        hirers: [],
        people: [
          {
            id: 'person1',
            email: 'tim@nudj.co'
          },
          {
            id: 'person2',
            email: 'jim@nudj.co'
          },
          {
            id: 'person3',
            email: 'jamie@nudj.co'
          }
        ]
      }

      expect(db.people.length).to.equal(3)

      await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

      expect(db.people.length).to.deep.equal(3)
      expect(db.people[0]).to.deep.equal({
        id: 'person1',
        email: 'tim@nudj.co'
      })
    })

    it('should create a hirer', async () => {
      const db = {
        companies: [
          {
            id: 'company1'
          }
        ],
        hirers: [],
        people: []
      }

      await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

      expect(db.hirers[0]).to.deep.equal({
        id: 'hirer1',
        company: 'company1',
        onboarded: false,
        person: 'person1',
        type: hirerTypes.MEMBER
      })
    })

    describe('when the person is already a hirer', () => {
      it('should not create a hirer', async () => {
        const db = {
          companies: [
            {
              id: 'company1'
            }
          ],
          hirers: [
            {
              id: 'hirer1',
              person: 'person1',
              company: 'company1'
            },
            {
              id: 'hirer2',
              person: 'person2',
              company: 'company2'
            },
            {
              id: 'hirer3',
              person: 'person3',
              company: 'company3'
            }
          ],
          people: []
        }

        expect(db.hirers.length).to.equal(3)

        await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

        expect(db.hirers.length).to.equal(3)
        expect(db.hirers[0]).to.deep.equal({
          id: 'hirer1',
          person: 'person1',
          company: 'company1'
        })
      })

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
              person: 'person1',
              company: 'company3'
            }
          ],
          people: []
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
  })

  describe('when the person does not exist', () => {
    it('should create a person', async () => {
      const db = {
        companies: [
          {
            id: 'company1'
          }
        ],
        hirers: [],
        people: []
      }

      expect(db.people.length).to.equal(0)

      await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

      expect(db.people[0]).to.deep.equal({
        id: 'person1',
        email: 'tim@nudj.co'
      })
    })

    it('should create a hirer', async () => {
      const db = {
        companies: [
          {
            id: 'company1'
          }
        ],
        hirers: [],
        people: []
      }

      await executeQueryOnDbUsingSchema({ operation, db, variables, schema })

      expect(db.hirers[0]).to.deep.equal({
        id: 'hirer1',
        company: 'company1',
        onboarded: false,
        person: 'person1',
        type: hirerTypes.MEMBER
      })
    })
  })

  it('should throw error if no emails are provided', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      hirers: [],
      people: []
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
