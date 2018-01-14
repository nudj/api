/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const gmailThread = require('../../helpers/mock-gmail-thread')

const expect = chai.expect

const nock = require('nock')
nock.emitter.on('no match', function (req) {
  console.log('No match for request:', req)
})

const tokenRefresh = nock('https://accounts.google.com')
const tokenValidation = nock('https://www.googleapis.com/')
const validAccessTokenThreadFetch = nock('https://www.googleapis.com/gmail/v1/users/me', {
  reqheaders: {
    authorization: 'Bearer VALID_ACCESS_TOKEN'
  }
})
const invalidAccessTokenThreadFetch = nock('https://www.googleapis.com/gmail/v1/users/me', {
  reqheaders: {
    authorization: 'Bearer I_AINT_NO_STINKIN_TOKEN'
  }
})

const mockThreadFetch = () => {
  validAccessTokenThreadFetch
    .get('/threads/VALID_THREAD_ID')
    .reply(200, gmailThread)
  validAccessTokenThreadFetch
    .get('/threads/BAD_THREAD_ID')
    .replyWithError('Invalid Thread ID')
  invalidAccessTokenThreadFetch
    .get('/threads/VALID_THREAD_ID')
    .replyWithError('Invalid Access Token')
}

const mockTokenValidation = () => {
  tokenValidation
    .get('/oauth2/v1/tokeninfo')
    .query({ access_token: 'VALID_ACCESS_TOKEN' })
    .reply(200)
  tokenValidation
    .get('/oauth2/v1/tokeninfo')
    .query({ access_token: 'I_AINT_NO_STINKIN_TOKEN' })
    .reply(400)
}

const mockTokenRefresh = () => {
  tokenRefresh
    .post('/o/oauth2/token', 'refresh_token=SUPREMELY_REFRESHING_TOKEN&grant_type=refresh_token')
    .reply(200, { access_token: 'VALID_ACCESS_TOKEN' })
  tokenRefresh
    .post('/o/oauth2/token')
    .replyWithError('Invalid Refresh Token')
}

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query fetchMessages ($userId: ID!) {
    user (id: $userId) {
      conversations {
        messages {
          id
          body
          recipient {
            id
          }
        }
      }
    }
  }
`
const variables = {
  userId: 'person3'
}
const baseData = {
  people: [
    {
      id: 'person3',
      email: 'woody@andysroom.com'
    }
  ],
  accounts: [
    {
      person: 'person3',
      type: 'GOOGLE',
      data: {
        accessToken: 'VALID_ACCESS_TOKEN',
        refreshToken: 'VALID_REFRESH_TOKEN'
      }
    }
  ]
}

describe('Conversation.messages', () => {
  beforeEach(() => {
    mockThreadFetch()
    mockTokenRefresh()
    mockTokenValidation()
  })

  it('should fetch all messages relating to the conversation', async () => {
    const db = merge(baseData, {
      conversations: [
        {
          id: 'conversation1',
          person: 'person3',
          type: 'GOOGLE',
          threadId: 'VALID_THREAD_ID'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          conversations: [
            {
              messages: [
                {
                  body: 'Where\'s my spaceship? Space command needs me.',
                  id: 'MESSAGE_1',
                  recipient: {
                    id: 'person3'
                  }
                },
                {
                  body: 'You. Are. A. Toy!',
                  id: 'MESSAGE_2',
                  recipient: {
                    id: 'person3'
                  }
                },
                {
                  body: 'Fine, it\'s downstairs.',
                  id: 'MESSAGE_3',
                  recipient: {
                    id: 'person2'
                  }
                }
              ]
            }
          ]
        }
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      conversations: [
        {
          id: 'conversation1',
          person: 'person9',
          type: 'OTHER',
          threadId: 'VALID_THREAD_ID'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          conversations: []
        }
      }
    })
  })
})
