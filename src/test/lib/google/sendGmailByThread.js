/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const nock = require('nock')

const { sendGmailByThread } = require('../../../gql/lib/google')

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

const mockGmailSend = () => {
  validTokenGoogle
    .post('/messages/send')
    .reply(200, { response: 'threadMessageSent', threadId: 'gmailThread' })
  validTokenGoogle
    .get('/threads/GMAIL_THREAD_ID')
    .reply(200, {
      messages: [
        {
          payload: {
            headers: [
              {
                name: 'Subject',
                value: 'Re: Hello!'
              }
            ]
          }
        }
      ]
    })
  invalidTokenGoogle
    .post('/messages/send')
    .replyWithError('Invalid Access Token')
}

const mockTokenValidation = () => {
  tokenValidation
    .get('/oauth2/v1/tokeninfo')
    .query({ access_token: 'VALID_ACCESS_TOKEN' })
    .times(2)
    .reply(200)
}

const mockTokenRefresh = () => {
  tokenRefresh
    .post('/o/oauth2/token', 'refresh_token=SUPREMELY_REFRESHING_TOKEN&grant_type=refresh_token')
    .reply(200, { access_token: 'VALID_ACCESS_TOKEN' })
  tokenRefresh
    .post('/o/oauth2/token')
    .replyWithError('Invalid Refresh Token')
}

const setupTransactions = (transaction, token) => {
  const person = {
    data: {
      firstName: 'Steven',
      lastName: 'Grayson',
      email: 'thegrayson@stevemail.com'
    }
  }
  const account = {
    data: {
      accessToken: token,
      refreshToken: 'SUPREMELY_REFRESHING_TOKEN'
    }
  }

  transaction.onCall(0).returns(person)
  transaction.onCall(1).returns(person)
  transaction.onCall(2).returns(account)
  transaction.onCall(3).returns(account)
  transaction.onCall(4).returns(account)
}

describe('sendGmailByThread', () => {
  const validAccessToken = 'VALID_ACCESS_TOKEN'
  const transaction = sinon.stub()

  nock.emitter.on('no match', function (req) {
    console.log('No match for request:', req)
  })

  beforeEach(() => {
    mockGmailSend()
    mockTokenRefresh()
    mockTokenValidation()
  })

  afterEach(() => {
    transaction.reset()
    nock.cleanAll()
  })

  it('calls sendGmail and sends new message', async () => {
    setupTransactions(transaction, validAccessToken)
    const body = 'Hey, how\'s it going?'
    const conversation = {
      threadId: 'GMAIL_THREAD_ID',
      recipient: 'person99',
      person: 'person101'
    }
    const context = { transaction }
    const data = await sendGmailByThread({ context, body, conversation })
    expect(data.response).to.equal('threadMessageSent')
  })
})
