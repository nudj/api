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
      messages {
        from {
          id
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
      email: 'hirer@email.com'
    },
    {
      id: 'person2',
      email: 'referrer@email.com'
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
      data: {
        accessToken: 'VALID_ACCESS_TOKEN',
        refreshToken: 'VALID_REFRESH_TOKEN'
      }
    }
  ]
}

describe('Message.from', () => {
  beforeEach(() => {
    mockTokenRefresh()
    mockTokenValidation()
  })

  after(() => {
    nock.cleanAll()
  })

  describe('when `from` is hirer who authorised with same email', () => {
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
    it('should fetch the message `from`', async () => {
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          conversation: {
            messages: [
              {
                from: {
                  id: 'person1'
                }
              }
            ]
          }
        }
      })
    })
  })

  describe('when `from` is referrer', () => {
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
    })
    it('should fetch the message `from`', async () => {
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          conversation: {
            messages: [
              {
                from: {
                  id: 'person2'
                }
              }
            ]
          }
        }
      })
    })
  })

  describe('when account is of type OTHER', () => {
    let extendedDb
    beforeEach(() => {
      extendedDb = merge(db, {
        conversations: [
          {
            id: 'conversation1',
            person: 'person1',
            recipient: 'person2',
            type: 'OTHER',
            threadId: 'VALID_THREAD_ID'
          }
        ]
      })
    })

    it('should return message `from`', async () => {
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db: extendedDb, schema })).to.eventually.deep.equal({
        data: {
          conversation: {
            messages: [
              {
                from: {
                  id: 'person1'
                }
              }
            ]
          }
        }
      })
    })
  })

  describe('when the request to Google fails', () => {
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
    it('should error with bad data', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      shouldRespondWithGqlError({
        path: [
          'conversation',
          'messages',
          0,
          'from'
        ]
      })(result)
    })
  })

  describe('when `from` is the hirer and account authorised with different email', () => {
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
                  value: 'Buzz Lightyear <hirer@differentemail.com>'
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
    it('should fetch the person via the account', () => {
      return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
        data: {
          conversation: {
            messages: [
              {
                from: {
                  id: 'person1'
                }
              }
            ]
          }
        }
      })
    })
  })
})
