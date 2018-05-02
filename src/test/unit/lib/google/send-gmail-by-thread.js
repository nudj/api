/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const nock = require('nock')
const proxyquire = require('proxyquire')

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

const fakePerson = {
  firstName: 'Steven',
  lastName: 'Grayson',
  email: 'thegrayson@stevemail.com'
}

describe('sendGmailByThread', () => {
  const sendGmail = sinon.stub()
  const transaction = sinon.stub()
  let sendGmailByThread

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
    sendGmailByThread = proxyquire('../../../../gql/lib/google/send-gmail-by-thread', {
      './send-gmail': sendGmail,
      './fetch-gmail-subject': () => 'Re: Seen my spaceship?',
      '../helpers/fetch-person': () => fakePerson
    })

    const body = 'Hey, how\'s it going?'
    const conversation = {
      threadId: validThreadId,
      recipient: 'person99',
      person: 'person101'
    }
    const context = {}
    await sendGmailByThread({ context, body, conversation })
    expect(sendGmail).to.have.been.calledWith({
      context: {},
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
    sendGmailByThread = proxyquire('../../../../gql/lib/google/send-gmail-by-thread', {
      './fetch-gmail-subject': () => 'Re: Seen my spaceship?',
      '../helpers/fetch-person': () => fakePerson
    })
    mockTokenValidation()

    const body = 'Hey, how\'s it going?'
    const conversation = {
      threadId: validThreadId,
      recipient: 'person99',
      person: 'person101'
    }
    const context = {
      sql: {
        readOne: () => ({ data: JSON.stringify({ accessToken: validAccessToken }) })
      }
    }
    await expect(sendGmailByThread({ context, body, conversation })).to.eventually.deep.equal({
      body: 'Hey, how\'s it going?',
      response: 'gmailSentResponse',
      threadId: 'gmailThread'
    })
  })
})
