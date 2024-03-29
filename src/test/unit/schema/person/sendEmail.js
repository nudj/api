/* eslint-env mocha */
const chai = require('chai')
const sinonChai = require('sinon-chai')
const nock = require('nock')

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

const expect = chai.expect
chai.use(sinonChai)

const tokenRefresh = nock('https://accounts.google.com')
const tokenValidation = nock('https://www.googleapis.com/')
const validTokenGoogle = nock('https://www.googleapis.com/gmail/v1/users/me', {
  reqheaders: {
    authorization: 'Bearer VALID_ACCESS_TOKEN'
  }
})
const invalidTokenGoogle = nock('https://www.googleapis.com/gmail/v1/users/me', {
  reqheaders: {
    authorization: 'Bearer I_AINT_NO_STINKIN_TOKEN'
  }
})

const mockGmailResponses = () => {
  validTokenGoogle
    .post('/messages/send')
    .reply(200, { threadId: 'gmailThread' })
  invalidTokenGoogle
    .post('/messages/send')
    .replyWithError('Invalid Access Token')
  tokenValidation
    .get('/oauth2/v1/tokeninfo')
    .query({ access_token: 'VALID_ACCESS_TOKEN' })
    .reply(200)
  tokenValidation
    .get('/oauth2/v1/tokeninfo')
    .query({ access_token: 'I_AINT_NO_STINKIN_TOKEN' })
    .reply(400)
  tokenRefresh
    .post('/o/oauth2/token', `refresh_token=SUPREMELY_REFRESHING_TOKEN&client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&grant_type=refresh_token`)
    .reply(200, { access_token: 'VALID_ACCESS_TOKEN' })
}

describe('Person.sendEmail', () => {
  beforeEach(() => {
    mockGmailResponses()
  })
  afterEach(() => {
    nock.cleanAll()
  })

  const sendSwankyEmail = `
    mutation sendSwankyEmail (
      $body: String!,
      $to: ID!,
      $subject: String!
    ) {
      user {
        email: sendEmail(
          body: $body,
          to: $to,
          subject: $subject
        ) {
          id
        }
      }
    }
  `
  const emailVariables = {
    body: 'I think it might be time we upgrade you from Demigod. Thoughts?',
    to: 'person2',
    subject: 'Demigod Status'
  }

  it('should send email and return conversation', async () => {
    const db = {
      conversations: [],
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE',
          data: JSON.stringify({
            accessToken: 'VALID_ACCESS_TOKEN',
            refreshToken: 'SUPREMELY_REFRESHING_TOKEN'
          })
        }
      ],
      people: [
        {
          id: 'person1',
          emailPreference: 'GOOGLE'
        },
        {
          id: 'person2',
          email: 'hercules@demigod.com'
        }
      ]
    }
    const operation = sendSwankyEmail
    const variables = emailVariables
    const response = await executeQueryOnDbUsingSchema({ operation, db, variables, schema })
    const { id } = response.data.user.email
    expect(id).to.exist()
    expect(id).to.equal('conversation1')
  })

  it('should still send with invalid accessToken', async () => {
    const db = {
      conversations: [],
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE',
          data: JSON.stringify({
            accessToken: 'I_AINT_NO_STINKIN_TOKEN',
            refreshToken: 'SUPREMELY_REFRESHING_TOKEN'
          })
        }
      ],
      people: [
        {
          id: 'person1',
          emailPreference: 'GOOGLE'
        },
        {
          id: 'person2',
          email: 'hercules@demigod.com'
        }
      ]
    }
    const operation = sendSwankyEmail
    const variables = emailVariables
    const response = await executeQueryOnDbUsingSchema({ operation, db, variables, schema })
    const { id } = response.data.user.email
    expect(id).to.exist()
    expect(id).to.equal('conversation1')
  })

  it('should refresh an invalid account accessToken', async () => {
    const db = {
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE',
          data: JSON.stringify({
            accessToken: 'I_AINT_NO_STINKIN_TOKEN',
            refreshToken: 'SUPREMELY_REFRESHING_TOKEN'
          })
        }
      ],
      people: [
        {
          id: 'person1',
          emailPreference: 'GOOGLE'
        },
        {
          id: 'person2',
          email: 'hercules@demigod.com'
        }
      ]
    }
    const operation = sendSwankyEmail
    const variables = emailVariables
    await executeQueryOnDbUsingSchema({ operation, db, variables, schema })
    expect(db.accounts).to.deep.equal([
      {
        id: 'account1',
        person: 'person1',
        type: 'GOOGLE',
        data: JSON.stringify({
          accessToken: 'VALID_ACCESS_TOKEN',
          refreshToken: 'SUPREMELY_REFRESHING_TOKEN'
        })
      }
    ])
  })

  it('should create a conversation for a new message', async () => {
    const db = {
      conversations: [],
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE',
          data: JSON.stringify({
            accessToken: 'I_AINT_NO_STINKIN_TOKEN',
            refreshToken: 'SUPREMELY_REFRESHING_TOKEN'
          })
        }
      ],
      people: [
        {
          id: 'person1',
          emailPreference: 'GOOGLE'
        },
        {
          id: 'person2',
          email: 'hercules@demigod.com'
        }
      ]
    }
    const operation = sendSwankyEmail
    const variables = emailVariables
    await executeQueryOnDbUsingSchema({ operation, db, variables, schema })
    expect(db.conversations).to.deep.equal([
      {
        id: 'conversation1',
        person: 'person1',
        recipient: 'person2',
        threadId: 'gmailThread',
        type: 'GOOGLE'
      }
    ])
  })

  it('should return null and error if no account is found', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ]
    }
    const operation = sendSwankyEmail
    const variables = emailVariables
    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        path: [
          'user',
          'email'
        ]
      }))
  })
})
