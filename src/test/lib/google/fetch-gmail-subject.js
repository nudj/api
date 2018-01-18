/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const proxyquire = require('proxyquire')
const { mockGmailThread } = require('../../helpers/google/mock-gmail-thread')
const { validAccessToken } = require('../../helpers/google/mock-tokens')

const thread = sinon.stub()
const fetchGmailSubject = proxyquire('../../../gql/lib/google/fetch-gmail-subject', {
  './fetch-account-tokens': () => ({ accessToken: validAccessToken }),
  './fetch-thread': thread
})

const expect = chai.expect
chai.use(sinonChai)

describe('Google.fetchGmailSubject', () => {
  afterEach(() => {
    thread.reset()
  })

  it('returns gmail thread subject', async () => {
    const shortThread = {
      messages: [
        mockGmailThread.messages[0], mockGmailThread.messages[0]
      ]
    }
    thread.returns(shortThread)
    const conversation = { threadId: 'GMAIL_THREAD_1', person: 'person1' }
    const context = {}
    const subject = await fetchGmailSubject({ context, conversation })
    expect(subject).to.equal('Seen my spaceship?')
  })

  it('returns subject with \'Re:\' prefix if necessary', async () => {
    thread.returns(mockGmailThread)
    const conversation = { threadId: 'GMAIL_THREAD_1', person: 'person1' }
    const context = {}
    const subject = await fetchGmailSubject({ context, conversation })
    expect(subject).to.equal('Re: Seen my spaceship?')
  })
})
