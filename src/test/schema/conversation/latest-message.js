/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const {
  mockThreadFetch,
  mockTokenRefresh,
  mockTokenValidation
} = require('../../helpers/google/mock-requests')

const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query fetchMessages ($userId: ID!) {
    user (id: $userId) {
      conversations {
        latestMessage {
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
    },
    {
      id: 'person2',
      email: 'buzz@spacecommand.com'
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

describe('Conversation.latestMessage', () => {
  beforeEach(() => {
    mockThreadFetch()
    mockTokenRefresh()
    mockTokenValidation()
  })

  it('should fetch the latest message in the conversation', async () => {
    const db = merge(baseData, {
      conversations: [
        {
          id: 'conversation1',
          person: 'person3',
          recipient: 'person2',
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
              latestMessage: {
                id: 'MESSAGE_3',
                body: 'Fine, it\'s downstairs.',
                recipient: {
                  id: 'person2'
                }
              }
            }
          ]
        }
      }
    })
  })

  it('should return bare message data if OTHER type', async () => {
    const db = merge(baseData, {
      conversations: [
        {
          id: 'conversation1',
          person: 'person3',
          recipient: 'person2',
          type: 'OTHER',
          threadId: 'VALID_THREAD_ID'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          conversations: [
            {
              latestMessage: {
                body: null,
                id: null,
                recipient: {
                  id: 'person2'
                }
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
          person: 'person101',
          type: 'GOOGLE',
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
