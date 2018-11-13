/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const clone = require('lodash/cloneDeep')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')
const {
  mockGreenhouseAPIRequests,
  VALID_HARVEST_KEY,
  INVALID_HARVEST_KEY,
  VALID_PARTNER_KEY,
  VALID_USER
} = require('../../helpers/greenhouse/mock-requests')

const baseDB = {
  companies: [{
    id: 'company1'
  }],
  companyIntegrations: [
    {
      id: 'companyIntegration1',
      company: 'company1',
      type: 'GREENHOUSE',
      data: {
        harvestKey: VALID_HARVEST_KEY,
        partnerKey: VALID_PARTNER_KEY,
        user: VALID_USER
      }
    }
  ]
}

const operation = `
  query {
    company (id: "company1") {
      integrationByFilters (filters: { type: "GREENHOUSE" }) {
        verify
      }
    }
  }
`

describe('CompanyIntegration.verify', () => {
  beforeEach(() => {
    mockGreenhouseAPIRequests()
  })
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when integration is of type `GREENHOUSE`', () => {
    describe('when the integration credentials are correct', () => {
      it('returns true', () => {
        const db = clone(baseDB)
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
          data: {
            company: {
              integrationByFilters: {
                verify: true
              }
            }
          }
        })
      })
    })

    describe('when the integration credentials are incorrect', () => {
      const db = {
        ...clone(baseDB),
        companyIntegrations: [
          {
            id: 'companyIntegration1',
            company: 'company1',
            type: 'GREENHOUSE',
            data: {
              harvestKey: INVALID_HARVEST_KEY,
              partnerKey: VALID_PARTNER_KEY,
              user: VALID_USER
            }
          }
        ]
      }

      it('throws an error', async () => {
        const result = await executeQueryOnDbUsingSchema({ operation, db, schema })
        shouldRespondWithGqlError({
          message: 'Verification failed',
          locations: [{ line: 4, column: 7 }],
          path: [
            'company',
            'integrationByFilters',
            'verify'
          ]
        })(result)
      })
    })
  })
})
