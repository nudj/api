/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const {
  mockThreadFetch,
  mockTokenRefresh,
  mockGmailSend,
  mockTokenValidation
} = require('../../helpers/google/mock-requests')

const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')
const operation = `
  query fetchMessages ($conversationId: ID!, $body: String!) {
    conversation (id: $conversationId) {
      sendMessage(body: $body) {
        body
      }
    }
  }
`
const variables = {
  conversationId: 'conversation1',
  body: 'Hello this is a message body!'
}
const baseData = {
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
  ]
}

describe('Conversation.sendMessage', () => {
  beforeEach(() => {
    mockThreadFetch()
    mockTokenValidation()
    mockGmailSend()
    mockTokenRefresh()
    mockTokenValidation()
  })

  it('should send and return new message', async () => {
    const db = merge(baseData, {
      conversations: [
        {
          id: 'conversation1',
          person: 'person3',
          recipient: 'person5',
          type: 'GOOGLE',
          threadId: 'VALID_THREAD_ID'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        conversation: {
          sendMessage: {
            body: 'Hello this is a message body!'
          }
        }
      }
    })
  })

  it('should throw error if of unknown or unimplemented type', async () => {
    const db = merge(baseData, {
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
    const result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    shouldRespondWithGqlError({
      path: [
        'conversation',
        'sendMessage'
      ]
    })(result)
  })

  it('should return null if no matches', async () => {
    const db = merge(baseData, {
      conversations: [
        {
          id: 'conversation2',
          person: 'person3',
          recipient: 'person5',
          type: 'GOOGLE',
          threadId: 'VALID_THREAD_ID'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        conversation: null
      }
    })
  })
})
