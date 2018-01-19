/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const nock = require('nock')

const { fetchAccountTokens } = require('../../../gql/lib/google')
const { mockTokenValidation } = require('../../helpers/google/mock-requests')
const {
  validAccessToken,
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
