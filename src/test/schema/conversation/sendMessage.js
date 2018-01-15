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
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query fetchMessages ($userId: ID!, $body: String!) {
    user (id: $userId) {
      conversations {
        sendMessage(body: $body)
      }
    }
  }
`
const variables = {
  userId: 'person3',
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

  it('should send a message', async () => {
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
        user: {
          conversations: [
            {
              sendMessage: {
                response: 'gmailSentResponse',
                threadId: 'gmailThread'
              }
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
