/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const proxyquire = require('proxyquire')
const dedent = require('dedent')
const {
  mockGmailThread,
  largeMockMessageThread
} = require('../../helpers/google/mock-gmail-thread')
const { validAccessToken } = require('../../helpers/google/mock-tokens')

const thread = sinon.stub()
const fetchGmailMessages = proxyquire('../../../gql/lib/google/fetch-gmail-messages', {
  './fetch-account-tokens': () => ({ accessToken: validAccessToken }),
  './fetch-thread': thread
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

  it('formats a large HTML Gmail message correctly', async () => {
    thread.returns(largeMockMessageThread)
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
        body: dedent`
          Hi Gavin,

          I'm perfectly acquiesced to your proposal concerning accepting and \
          understanding jobs and hitherto therein.  Furthermore, with my mumbo \
          jumbo ad nauseam, I am quite pleased with our splendiferous and \
          fortuitous agreement.

          However, it has come to my attention that you are lacking in a \
          certain subset of desirable enigmatic properties that are specific \
          to my gracious request.

          Therefore, I must conclude that you are unfit for the role.  Lols.

          Yours,
          Gavin. CEO.
        `
      }
    ])
  })
})
