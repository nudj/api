/* eslint-env mocha */
const chai = require('chai')
const sinonChai = require('sinon-chai')
const nock = require('nock')

const { fetchAccountTokens } = require('../../../../gql/lib/google')
const { mockTokenValidation } = require('../../helpers/google/mock-requests')
const {
  validAccessToken,
  refreshToken
} = require('../../helpers/google/mock-tokens')

const expect = chai.expect
chai.use(sinonChai)

describe('Google', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  describe('fetchAccountTokens', () => {
    beforeEach(() => {
      mockTokenValidation()
    })

    it('returns provided accessToken if valid', async () => {
      const account = {
        data: JSON.stringify({
          accessToken: validAccessToken,
          refreshToken
        })
      }
      const readOne = () => account
      const context = {
        sql: { readOne }
      }
      const person = { id: 'person1' }
      const data = await fetchAccountTokens(context, person)
      expect(data).to.deep.equal(JSON.parse(account.data))
    })

    it('throws error if no account exists', async () => {
      const readOne = () => {}
      const context = {
        sql: { readOne }
      }
      const person = { id: 'person1' }
      expect(fetchAccountTokens(context, person)).to.be.rejectedWith('No google account found')
    })
  })
})
