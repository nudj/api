/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const { merge } = require('@nudj/library')
const {
  mockTokenRefresh,
  mockTokenValidation
} = require('../../helpers/google/mock-requests')

const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

const validAccessTokenGoogle = nock('https://www.googleapis.com/gmail/v1/users/me', {
  reqheaders: {
    authorization: `Bearer VALID_ACCESS_TOKEN`
  }
})

const mockThreadFetchWith = (data) => {
  validAccessTokenGoogle
    .get(`/threads/VALID_THREAD_ID`)
    .reply(200, data)
}

const operation = `
  query fetchMessages ($conversationId: ID!) {
    conversation (id: $conversationId) {
      latestMessage {
        body
        from {
          email
        }
      }
    }
  }
`
const variables = {
  conversationId: 'conversation1'
}
const db = {
  people: [
    {
      id: 'person1',
      email: 'hirer@email.com',
      emailPreference: 'GOOGLE'
    },
    {
      id: 'person2',
      email: 'referrer@email.com',
      emailPreference: 'GOOGLE'
    }
  ],
  conversations: [
    {
      id: 'conversation1',
      person: 'person1',
      recipient: 'person2',
      type: 'GOOGLE',
      threadId: 'VALID_THREAD_ID'
    }
  ],
  accounts: [
    {
      person: 'person1',
      type: 'GOOGLE',
      emailAddress: 'hirer@differentemail.com',
      data: JSON.stringify({
        accessToken: 'VALID_ACCESS_TOKEN',
        refreshToken: 'VALID_REFRESH_TOKEN'
      })
    }
  ]
}

describe('Conversation.latestMessage', () => {
  beforeEach(() => {
    mockTokenRefresh()
    mockTokenValidation()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('when conversation is of type GOOGLE', () => {
    beforeEach(() => {
      mockThreadFetchWith({
        messages: [
          {
            id: 'MESSAGE_1',
            internalDate: '1515758519000',
            payload: {
              mimeType: 'text/html',
              headers: [
                {
                  name: 'Subject',
                  value: 'Seen my spaceship?'
                },
                {
                  name: 'To',
                  value: 'referrer@email.com'
                },
                {
                  name: 'From',
                  value: 'Buzz Lightyear <hirer@email.com>'
                }
              ],
              body: {
                size: 243,
                data: 'V2hlcmUncyBteSBzcGFjZXNoaXA/IFNwYWNlIGNvbW1hbmQgbmVlZHMgbWUu'
              }
            },
            sizeEstimate: 660
          }
        ]
      })
    })
    it('should fetch the latest message in the conversation', async () => {
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          conversation: {
            latestMessage: {
              body: 'Where\'s my spaceship? Space command needs me.',
              from: {
                email: 'hirer@email.com'
              }
            }
          }
        }
      })
    })
  })

  describe('when conversation is of type OTHER', () => {
    let extendedDb
    beforeEach(() => {
      mockThreadFetchWith({
        messages: [
          {
            id: 'MESSAGE_1',
            internalDate: '1515758519000',
            payload: {
              mimeType: 'text/html',
              headers: [
                {
                  name: 'Subject',
                  value: 'Seen my spaceship?'
                },
                {
                  name: 'To',
                  value: 'Buzz Lightyear <hirer@email.com>'
                },
                {
                  name: 'From',
                  value: 'referrer@email.com'
                }
              ],
              body: {
                size: 243,
                data: 'V2hlcmUncyBteSBzcGFjZXNoaXA/IFNwYWNlIGNvbW1hbmQgbmVlZHMgbWUu'
              }
            },
            sizeEstimate: 660
          }
        ]
      })
      extendedDb = merge(db, {
        conversations: [
          {
            id: 'conversation1',
            person: 'person1',
            recipient: 'person2',
            type: 'OTHER'
          }
        ]
      })
    })
    it('should fetch a message with a null body', async () => {
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db: extendedDb, schema })).to.eventually.deep.equal({
        data: {
          conversation: {
            latestMessage: {
              body: null,
              from: {
                email: 'hirer@email.com'
              }
            }
          }
        }
      })
    })
  })

  describe('when the user\'s data is out of sync', () => {
    let extendedDb
    beforeEach(() => {
      extendedDb = merge(db, {
        conversations: [
          {
            id: 'conversation1',
            recipient: 'person2',
            type: 'GOOGLE',
            threadId: 'VALID_THREAD_ID'
          }
        ],
        people: [
          {
            id: 'person7',
            emailPreference: 'GOOGLE'
          }
        ]
      })
      mockThreadFetchWith({
        messages: [
          {
            id: 'MESSAGE_1',
            internalDate: '1515758519000',
            payload: {
              mimeType: 'text/html',
              headers: [
                {
                  name: 'Subject',
                  value: 'Seen my spaceship?'
                },
                {
                  name: 'To',
                  value: 'Buzz Lightyear <gooble@email.com>'
                },
                {
                  name: 'From',
                  value: 'dog@email.com'
                }
              ],
              body: {
                size: 243,
                data: 'V2hlcmUncyBteSBzcGFjZXNoaXA/IFNwYWNlIGNvbW1hbmQgbmVlZHMgbWUu'
              }
            },
            sizeEstimate: 660
          }
        ]
      })
    })
    it('should throw an error', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, variables, db: extendedDb, schema })
      shouldRespondWithGqlError({
        path: [
          'conversation',
          'latestMessage'
        ]
      })(result)
    })
  })
})
