/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const { merge } = require('@nudj/library')
const {
  mockTokenValidation,
  mockGmailSend,
  mockThreadFetch
} = require('../../helpers/google/mock-requests')

const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

const operation = `
  query fetchMessages ($conversationId: ID!, $body: String!) {
    conversation (id: $conversationId) {
      sendMessage(body: $body) {
        body
        from {
          email
        }
      }
    }
  }
`
const variables = {
  conversationId: 'conversation1',
  body: 'Hello this is a message body!'
}
const db = {
  people: [
    {
      id: 'person3',
      firstName: 'Sheriff',
      lastName: 'Woody',
      email: 'woody@andysroom.com'
    },
    {
      id: 'person5',
      firstName: 'Buzz',
      lastName: 'Lightyear',
      email: 'buzz@starcommand.com'
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
  ],
  conversations: [
    {
      id: 'conversation1',
      person: 'person3',
      recipient: 'person5',
      type: 'GOOGLE',
      threadId: 'VALID_THREAD_ID'
    }
  ]
}

describe('Conversation.sendMessage', () => {
  beforeEach(() => {
    mockTokenValidation()
    mockGmailSend()
    mockThreadFetch()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('when conversation is of type GOOGLE', () => {
    beforeEach(() => {
      mockTokenValidation()
    })
    it('should fetch the latest message in the conversation', async () => {
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          conversation: {
            sendMessage: {
              body: 'Hello this is a message body!',
              from: {
                email: 'woody@andysroom.com'
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
      extendedDb = merge(db, {
        conversations: [
          {
            id: 'conversation1',
            person: 'person3',
            recipient: 'person5',
            type: 'OTHER',
            threadId: 'VALID_THREAD_ID'
          }
        ]
      })
    })
    it('should throw error', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, variables, db: extendedDb, schema })
      shouldRespondWithGqlError({
        path: [
          'conversation',
          'sendMessage'
        ]
      })(result)
    })
  })
})
