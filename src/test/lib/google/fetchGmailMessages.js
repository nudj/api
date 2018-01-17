/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const proxyquire = require('proxyquire')
const mockGmailThread = require('../../helpers/google/mock-gmail-thread')
const { validAccessToken } = require('../../helpers/google/mock-tokens')

const thread = sinon.stub()
const fetchGmailMessages = proxyquire('../../../gql/lib/google/fetchGmailMessages', {
  './fetchAccountTokens': () => ({ accessToken: validAccessToken }),
  './fetchThread': thread
})

const expect = chai.expect
chai.use(sinonChai)

describe('Google.fetchGmailMessages', () => {
  afterEach(() => {
    thread.reset()
  })

  it('returns decoded formatted thread messages', async () => {
    thread.returns(mockGmailThread)
    const conversation = { threadId: 'GMAIL_THREAD_1', person: 'person1' }
    const transaction = sinon.stub().returns({ id: 'personId' })
    const context = { transaction }
    const messages = await fetchGmailMessages({ context, conversation })
    expect(messages).to.deep.equal([
      {
        id: 'MESSAGE_1',
        from: { id: 'personId' },
        to: { id: 'personId' },
        date: '1515758519000',
        body: 'Where\'s my spaceship? Space command needs me.'
      },
      {
        id: 'MESSAGE_2',
        from: { id: 'personId' },
        to: { id: 'personId' },
        date: '1515758631000',
        body: 'You\nAre\nA\nToy!'
      },
      {
        id: 'MESSAGE_3',
        from: { id: 'personId' },
        to: { id: 'personId' },
        date: '1515847314000',
        body: 'Fine\n\nIt\'s downstairs\nPS. You are a toy.'
      }
    ])
  })
})
