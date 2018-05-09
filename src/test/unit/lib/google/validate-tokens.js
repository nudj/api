/* eslint-env mocha */
const chai = require('chai')
const sinonChai = require('sinon-chai')
const nock = require('nock')

const { validateTokens } = require('../../../../gql/lib/google')
const {
  mockTokenValidation,
  mockTokenRefresh
} = require('../../helpers/google/mock-requests')
const {
  validAccessToken,
  invalidAccessToken,
  refreshToken
} = require('../../helpers/google/mock-tokens')

const expect = chai.expect
chai.use(sinonChai)

describe('Google', () => {
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
      const data = await validateTokens(invalidAccessToken, refreshToken)
      expect(data.accessToken).to.equal(validAccessToken)
      expect(data.refreshed).to.be.true()
    })

    it('errors with invalid refreshToken', async () => {
      mockTokenRefresh()
      await expect(
        validateTokens(invalidAccessToken, '*HNQ£D)CASC:')
      ).to.be.rejectedWith('Invalid Refresh Token')
    })
  })
})
