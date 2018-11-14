/* eslint-env mocha */
const chai = require('chai')
const greenhouseVerification = require('../../../../gql/lib/greenhouse/verification')
const expect = chai.expect

const mockApi = {
  get: type => Promise.resolve()
}

const emulateHarvestError = ({ type, status, statusText, message }) => {
  const error = new Error(`Request failed with status code ${status}`)
  error.response = {
    status,
    statusText,
    config: {
      url: `https://harvest.greenhouse.io/v1/${type}`
    },
    data: {
      message
    }
  }

  throw error
}

const emulatePartnerError = ({ type, status, statusText, message }) => {
  const error = new Error(`Request failed with status code ${status}`)
  error.response = {
    status,
    statusText,
    config: {
      url: `https://partner.greenhouse.io/v1/${type}`
    },
    data: {
      errors: [{ message }]
    }
  }

  throw error
}

describe('Greenhouse verification', () => {
  let verify

  describe('when all authorisation credentials are correct', () => {
    beforeEach(() => {
      verify = greenhouseVerification({
        partner: mockApi,
        harvest: mockApi
      })
    })

    it('does not throw an error', async () => {
      expect(verify()).to.not.eventually.be.rejected()
    })
  })

  describe('when harvestKey permissions are incorrect', () => {
    beforeEach(() => {
      verify = greenhouseVerification({
        partner: mockApi,
        harvest: {
          get: async type => emulateHarvestError({
            type,
            status: 403,
            statusText: 'Forbidden',
            message: 'This API Key does not have permission for this endpoint'
          })
        }
      })
    })

    it('throws the appropriate error', async () => {
      try {
        await verify()
        throw new Error('Should not have reached this')
      } catch (error) {
        expect(error.message).to.equal('Verification failed')
        expect(error.fields).to.deep.equal([{
          field: 'harvestKey',
          code: 403,
          message: 'This API Key does not have permission for this endpoint',
          endpoint: 'jobs'
        }])
      }
    })
  })

  describe('when the harvestKey is invalid', () => {
    beforeEach(() => {
      verify = greenhouseVerification({
        partner: mockApi,
        harvest: {
          get: async type => emulateHarvestError({
            type,
            status: 401,
            statusText: 'Unauthorized',
            message: 'Invalid Basic Auth credentials'
          })
        }
      })
    })

    it('throws the appropriate error', async () => {
      try {
        await verify()
        throw new Error('Should not have reached this')
      } catch (error) {
        expect(error.message).to.equal('Verification failed')
        expect(error.fields).to.deep.equal([{
          field: 'harvestKey',
          code: 401,
          message: 'Invalid Basic Auth credentials',
          endpoint: 'jobs'
        }])
      }
    })
  })

  describe('when the partnerKey is invalid', () => {
    beforeEach(() => {
      verify = greenhouseVerification({
        harvest: mockApi,
        partner: {
          get: async type => emulatePartnerError({
            type,
            status: 401,
            statusText: 'Unauthorized',
            message: 'Unauthorized'
          })
        }
      })
    })

    it('throws the appropriate error', async () => {
      try {
        await verify()
        throw new Error('Should not have reached this')
      } catch (error) {
        expect(error.message).to.equal('Verification failed')
        expect(error.fields).to.deep.equal([{
          field: 'partnerKey',
          code: 401,
          message: 'Unauthorized',
          endpoint: 'current_user'
        }])
      }
    })
  })

  describe('when the Harvest API rate limit has been reached', () => {
    beforeEach(() => {
      verify = greenhouseVerification({
        partner: mockApi,
        harvest: {
          get: async type => emulateHarvestError({
            type,
            status: 429,
            statusText: 'Rate limit reached',
            message: 'Rate limit reached'
          })
        }
      })
    })

    it('throws the appropriate error', async () => {
      try {
        await verify()
        throw new Error('Should not have reached this')
      } catch (error) {
        expect(error.message).to.equal('Verification failed')
        expect(error.fields).to.deep.equal([{
          field: 'harvestKey',
          code: 429,
          message: 'Rate limit reached',
          endpoint: 'jobs'
        }])
      }
    })
  })
})
