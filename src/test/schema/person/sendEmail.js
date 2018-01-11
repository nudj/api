/* eslint-env mocha */
const chai = require('chai')
const sinonChai = require('sinon-chai')
const nock = require('nock')

const schema = require('../../../gql/schema')
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
    .reply(200, 'Gmail Sent')
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
    .post('/o/oauth2/token', 'refresh_token=SUPREMELY_REFRESHING_TOKEN&grant_type=refresh_token')
    .reply(200, { access_token: 'VALID_ACCESS_TOKEN' })
  tokenRefresh
    .post('/o/oauth2/token')
    .replyWithError('Invalid Refresh Token')
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
      $userId: ID!,
      $body: String!,
      $to: String!,
      $from: String!,
      $subject: String!
    ) {
      user (id: $userId) {
        email: sendEmail(body: $body, to: $to, from: $from, subject: $subject)
      }
    }
  `
  const emailVariables = {
    userId: 'person1',
    body: 'I think it might be time we upgrade you from Demigod. Thoughts?',
    from: 'Zeus <zeus@gmail.com>',
    to: 'hercules@demigod.com',
    subject: 'Demigod Status'
  }

  it('should send email', async () => {
    const db = {
      conversations: [],
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE',
          data: {
            accessToken: 'VALID_ACCESS_TOKEN',
            refreshToken: 'SUPREMELY_REFRESHING_TOKEN'
          }
        }
      ],
      people: [
        {
          id: 'person1'
        }
      ]
    }
    const operation = sendSwankyEmail
    const variables = emailVariables
    const response = await executeQueryOnDbUsingSchema({ operation, db, variables, schema })
    const data = response.data.user.email
    expect(data).to.equal('Gmail Sent')
  })

  it('should still send with invalid accessToken', async () => {
    const db = {
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE',
          data: {
            accessToken: 'I_AINT_NO_STINKIN_TOKEN',
            refreshToken: 'SUPREMELY_REFRESHING_TOKEN'
          }
        }
      ],
      people: [
        {
          id: 'person1'
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
    const data = response.data.user.email
    expect(data).to.equal('Gmail Sent')
  })

  it('should refresh an invalid account accessToken', async () => {
    const db = {
      accounts: [
        {
          id: 'account1',
          person: 'person1',
          type: 'GOOGLE',
          data: {
            accessToken: 'I_AINT_NO_STINKIN_TOKEN',
            refreshToken: 'SUPREMELY_REFRESHING_TOKEN'
          }
        }
      ],
      people: [
        {
          id: 'person1'
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
        data: {
          accessToken: 'VALID_ACCESS_TOKEN',
          refreshToken: 'SUPREMELY_REFRESHING_TOKEN'
        }
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
        message: 'NotFound',
        path: [
          'user',
          'email'
        ]
      }))
  })
})
