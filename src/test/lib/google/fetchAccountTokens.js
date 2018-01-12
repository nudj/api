/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const nock = require('nock')

const { fetchAccountTokens } = require('../../../gql/lib/google')

const expect = chai.expect
chai.use(sinonChai)

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

describe('Google', () => {
  const validAccessToken = 'VALID_ACCESS_TOKEN'
  const refreshToken = 'SUPREMELY_REFRESHING_TOKEN'

  nock.emitter.on('no match', function (req) {
    console.log('No match for request:', req)
  })

  afterEach(() => {
    nock.cleanAll()
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
