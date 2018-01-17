/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const nock = require('nock')
const dedent = require('dedent')

const { sendGmail } = require('../../../gql/lib/google')
const {
  mockGmailSend,
  mockGmailSendWithBody,
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
      mockTokenRefresh()
      mockTokenValidation()
    })

    it('sends successfully with valid accessToken', async () => {
      mockGmailSend()
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
      mockGmailSend()
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
      mockGmailSendWithBody()
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
      const messageBody = data
        .split(':')[data.split(':').length - 1]
        .split('1.0')[1]
        .replace(/\r\n/g, '')
      expect(messageBody).to.equal(dedent`
        There were so many bothans<div>And I don\'t know how I can recover those \
        plans, I think they\'re gone.<div><br></div>Sorry about that Emperor. Love \
        you babs.</div>
      `)
    })
  })
})
