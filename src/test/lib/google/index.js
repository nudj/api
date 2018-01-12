/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const nock = require('nock')

const {
  sendGmail,
  validateTokens,
  fetchAccountTokens
} = require('../../../gql/lib/google')

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
    .reply(200, { response: 'gmailSentResponse', threadId: 'gmailThread' })
  invalidTokenGoogle
    .post('/messages/send')
    .replyWithError('Invalid Access Token')
}

const mockTokenValidation = () => {
  tokenValidation
    .get('/oauth2/v1/tokeninfo')
    .query({ access_token: 'VALID_ACCESS_TOKEN' })
    .reply(200)
  tokenValidation
    .get('/oauth2/v1/tokeninfo')
    .query({ access_token: 'I_AINT_NO_STINKIN_TOKEN' })
    .reply(400)
}

const mockTokenRefresh = () => {
  tokenRefresh
    .post('/o/oauth2/token', 'refresh_token=SUPREMELY_REFRESHING_TOKEN&grant_type=refresh_token')
    .reply(200, { access_token: 'VALID_ACCESS_TOKEN' })
  tokenRefresh
    .post('/o/oauth2/token')
    .replyWithError('Invalid Refresh Token')
}

describe('Google', () => {
  const validAccessToken = 'VALID_ACCESS_TOKEN'
  const badAccessToken = 'I_AINT_NO_STINKIN_TOKEN'
  const refreshToken = 'SUPREMELY_REFRESHING_TOKEN'

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
      const person = { id: 'person1' }
      expect(sendGmail({ email, person }))
        .to.be.rejectedWith('Invalid Access Token')
    })
  })

  describe('validateTokens', () => {
    beforeEach(() => {
      mockTokenValidation()
    })

    it('returns provided accessToken if valid', async () => {
      const data = await validateTokens(validAccessToken, refreshToken)
      expect(data.accessToken).to.equal(validAccessToken)
      expect(data.refreshed).to.be.false()
    })

    it('refreshes accessToken with invalid accessToken', async () => {
      mockTokenRefresh()
      const data = await validateTokens(badAccessToken, refreshToken)
      expect(data.accessToken).to.equal(validAccessToken)
      expect(data.refreshed).to.be.true()
    })

    it('errors with invalid refreshToken', async () => {
      mockTokenRefresh()
      await expect(
        validateTokens(badAccessToken, '*HNQ£D)CASC:')
      ).to.be.rejectedWith('Invalid Refresh Token')
    })
  })

  describe('fetchAccountTokens', () => {
    beforeEach(() => {
      mockTokenValidation()
    })

    it('returns provided accessToken if valid', async () => {
      const account = {
        data: {
          accessToken: validAccessToken,
          refreshToken
        }
      }
      const transaction = sinon.stub().returns(account)
      const context = { transaction }
      const person = { id: 'person1' }
      const data = await fetchAccountTokens(context, person)
      expect(data).to.equal(account.data)
    })

    it('throws error if no account exists', async () => {
      const transaction = sinon.stub().returns(undefined)
      const context = { transaction }
      const person = { id: 'person1' }
      expect(fetchAccountTokens(context, person)).to.be.rejectedWith('No google account found')
    })
  })
})
