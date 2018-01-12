/* eslint-env mocha */
const chai = require('chai')
const sinonChai = require('sinon-chai')
const nock = require('nock')

const { validateTokens } = require('../../../gql/lib/google')

const expect = chai.expect
chai.use(sinonChai)

const tokenRefresh = nock('https://accounts.google.com')
const tokenValidation = nock('https://www.googleapis.com/')

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
})
