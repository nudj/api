/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const { merge } = require('@nudj/library')
const {
  mockThreadFetch,
  mockTokenRefresh,
  mockTokenValidation
} = require('../../helpers/google/mock-requests')
const {
  validAccessToken,
  validRefreshToken,
  validThreadId
} = require('../../helpers/google/mock-tokens')

const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query fetchMessages {
    user {
      conversations {
        subject
      }
    }
  }
`
const baseData = {
  people: [
    {
      id: 'person1',
      email: 'woody@andysroom.com'
    }
  ],
  accounts: [
    {
      person: 'person1',
      type: 'GOOGLE',
      data: JSON.stringify({
        accessToken: validAccessToken,
        refreshToken: validRefreshToken
      })
    }
  ]
}

describe('Conversation.subject', () => {
  beforeEach(() => {
    mockThreadFetch()
    mockTokenRefresh()
    mockTokenValidation()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should fetch the conversation subject', async () => {
    const db = merge(baseData, {
      conversations: [
        {
          id: 'conversation1',
          person: 'person1',
          type: 'GOOGLE',
          threadId: validThreadId
        }
      ],
      people: [
        {
          id: 'person1',
          emailPreference: 'GOOGLE'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          conversations: [
            {
              subject: 'Re: Seen my spaceship?'
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
          person: 'person12',
          type: 'GOOGLE',
          threadId: validThreadId
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        user: {
          conversations: []
        }
      }
    })
  })
})
