/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
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
        messages {
          id
          body
          to {
            id
            email
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

describe('Conversation.messages', () => {
  beforeEach(() => {
    mockThreadFetch()
    mockTokenRefresh()
    mockTokenValidation()
  })

  afterEach(() => {
    nock.cleanAll()
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
                  to: {
                    id: 'person3',
                    email: 'woody@andysroom.com'
                  }
                },
                {
                  body: 'You\nAre\nA\nToy!',
                  id: 'MESSAGE_2',
                  to: {
                    id: 'person3',
                    email: 'woody@andysroom.com'
                  }
                },
                {
                  body: 'Fine\n\nIt\'s downstairs\nPS. You are a toy.',
                  id: 'MESSAGE_3',
                  to: {
                    id: 'person2',
                    email: 'buzz@spacecommand.com'
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
