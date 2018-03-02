/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const nock = require('nock')
const dedent = require('dedent')

const { sendGmail } = require('../../../../gql/lib/google')
const {
  mockGmailSend,
  mockTokenRefresh,
  mockTokenValidation
} = require('../../helpers/google/mock-requests')
const {
  validAccessToken,
  invalidAccessToken,
  refreshToken
} = require('../../helpers/google/mock-tokens')

const expect = chai.expect
chai.use(sinonChai)

describe('Google', () => {
  nock.emitter.on('no match', function (req) {
    console.log('No match for request:', req)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('sendGmail', () => {
    beforeEach(() => {
      mockGmailSend()
      mockTokenRefresh()
      mockTokenValidation()
    })

    it('sends successfully with valid accessToken', async () => {
      const email = {
        to: 'darthvader@gmail.com',
        from: 'palpatine@gmail.com',
        subject: 'RE: Death Star Plans',
        body: 'How many Bothans were there, anyway?'
      }
      const account = {
        data: {
          accessToken: validAccessToken,
          refreshToken
        }
      }
      const transaction = sinon.stub().returns(account)
      const context = { transaction }
      const person = { id: 'person1' }
      const data = await sendGmail({ context, email, person })
      expect(data.response).to.equal('gmailSentResponse')
    })

    it('errors with invalid accessToken', async () => {
      const email = {
        to: 'darthvader@gmail.com',
        from: 'palpatine@gmail.com',
        subject: 'RE: Death Star Plans',
        body: 'How many Bothans were there, anyway?'
      }
      const account = {
        data: {
          accessToken: invalidAccessToken,
          refreshToken
        }
      }
      const transaction = sinon.stub().returns(account)
      const context = { transaction }
      const person = { id: 'person1' }
      await expect(
        sendGmail({ context, email, person })
      ).to.be.rejectedWith('Invalid Access Token')
    })

    it('formats the outbound email as an appropriate html string', async () => {
      const body = dedent`
        There were so many bothans\nAnd I don\'t know how I can recover those \
        plans, I think they\'re gone.\n\nSorry about that Emperor. Love you babs.
      `
      const email = {
        to: 'palpatine@gmail.com',
        from: 'darthvader@gmail.com',
        subject: 'RE: Death Star Plans',
        body
      }
      const account = {
        data: {
          accessToken: validAccessToken,
          refreshToken
        }
      }
      const transaction = sinon.stub().returns(account)
      const context = { transaction }
      const person = { id: 'person1' }
      const data = await sendGmail({ context, email, person })
      expect(data.body).to.equal(dedent`
        There were so many bothans<div>And I don\'t know how I can recover those \
        plans, I think they\'re gone.<div><br></div><div>Sorry about that Emperor. Love \
        you babs.</div></div>
      `)
    })
  })
})
