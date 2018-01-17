/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const nock = require('nock')
const proxyquire = require('proxyquire')

const sendGmailCall = require('../../../gql/lib/google/sendGmailByThread')
const {
  mockGmailSend,
  mockTokenRefresh,
  mockTokenValidation,
  mockThreadFetch
} = require('../../helpers/google/mock-requests')
const {
  validAccessToken,
  validThreadId
} = require('../../helpers/google/mock-tokens')

const expect = chai.expect
chai.use(sinonChai)

const setupTransactions = (transaction, token) => {
  const person = {
    firstName: 'Steven',
    lastName: 'Grayson',
    email: 'thegrayson@stevemail.com'
  }
  const account = {
    data: {
      accessToken: token,
      refreshToken: 'SUPREMELY_REFRESHING_TOKEN'
    }
  }

  transaction.onCall(0).returns(person)
  transaction.onCall(1).returns(person)
  transaction.returns(account)
}

describe('sendGmailByThread', () => {
  const sendGmail = sinon.stub()
  const transaction = sinon.stub()
  let sendGmailByThread

  nock.emitter.on('no match', function (req) {
    console.log('No match for request:', req)
  })

  beforeEach(() => {
    mockThreadFetch()
    mockGmailSend()
    mockTokenRefresh()
    mockTokenValidation()
  })

  afterEach(() => {
    sendGmail.reset()
    transaction.reset()
    nock.cleanAll()
  })

  it('calls sendGmail and sends new message', async () => {
    sendGmailByThread = proxyquire('../../../gql/lib/google/sendGmailByThread', {
      './sendGmail': sendGmail
    })
    mockTokenValidation()
    setupTransactions(transaction, validAccessToken)
    const body = 'Hey, how\'s it going?'
    const conversation = {
      threadId: validThreadId,
      recipient: 'person99',
      person: 'person101'
    }
    const context = { transaction }
    await sendGmailByThread({ context, body, conversation })
    expect(sendGmail).to.have.been.calledWith({
      context: { transaction },
      email: {
        body: 'Hey, how\'s it going?',
        from: 'Steven Grayson <thegrayson@stevemail.com>',
        subject: 'Re: Seen my spaceship?',
        to: 'thegrayson@stevemail.com'
      },
      person: {
        email: 'thegrayson@stevemail.com',
        firstName: 'Steven',
        lastName: 'Grayson'
      },
      threadId: 'VALID_THREAD_ID'
    })
  })

  it('returns resolved data', async () => {
    sendGmailByThread = sendGmailCall
    mockTokenValidation()
    setupTransactions(transaction, validAccessToken)
    const body = 'Hey, how\'s it going?'
    const conversation = {
      threadId: validThreadId,
      recipient: 'person99',
      person: 'person101'
    }
    const context = { transaction }
    await expect(sendGmailByThread({ context, body, conversation })).to.eventually.deep.equal({
      body: 'Hey, how\'s it going?',
      response: 'gmailSentResponse',
      threadId: 'gmailThread'
    })
  })
})
