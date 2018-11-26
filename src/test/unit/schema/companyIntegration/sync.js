/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const clone = require('lodash/cloneDeep')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')
const {
  mockGreenhouseAPIRequests,
  VALID_HARVEST_KEY,
  VALID_PARTNER_KEY,
  INVALID_HARVEST_KEY,
  VALID_USER
} = require('../../helpers/greenhouse/mock-requests')

const baseDB = {
  applications: [
    { id: 'application1', job: 'job3' }
  ],
  referrals: [
    { id: 'referral1', job: 'job3' }
  ],
  intros: [
    { id: 'intro1', job: 'job3' }
  ],
  jobTags: [
    { id: 'jobTag1', job: 'job3' }
  ],
  atsJobs: [
    { id: 'atsJob1', externalId: 'gJob1', jobId: 'job1' },
    { id: 'atsJob2', externalId: 'gJob2', jobId: 'job2' },
    { id: 'atsJob3', externalId: 'gJob3', jobId: 'job3' }
  ],
  jobs: [
    { id: 'job1', company: 'company1' },
    { id: 'job2', company: 'company1' },
    { id: 'job3', company: 'company1' }
  ],
  companies: [{
    id: 'company1',
    name: 'Company One'
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
  ],
  hirers: [{
    id: 'hirer1',
    person: 'person1',
    company: 'company1',
    type: hirerTypes.ADMIN
  }],
  people: [{
    id: 'person1'
  }]
}

const operation = `
  query syncIntegration ($type: CompanyIntegrationType) {
    company (id: "company1") {
      integrationByFilters(filters: { type: $type }) {
        sync
      }
    }
  }
`
const variables = {
  type: 'GREENHOUSE'
}

describe('CompanyIntegration.sync', () => {
  beforeEach(() => {
    mockGreenhouseAPIRequests()
  })
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when integration is of type `GREENHOUSE`', () => {
    describe('when the sync succeeds', () => {
      it('returns true', () => {
        const db = clone(baseDB)
        return expect(executeQueryOnDbUsingSchema({ operation, db, schema, variables })).to.eventually.deep.equal({
          data: {
            company: {
              integrationByFilters: {
                sync: true
              }
            }
          }
        })
      })
    })

    describe('when the sync fails', () => {
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
        const result = await executeQueryOnDbUsingSchema({ operation, db, schema, variables })
        shouldRespondWithGqlError({
          message: 'Request failed with status code 401',
          locations: [{ line: 4, column: 7 }],
          path: [
            'company',
            'integrationByFilters',
            'sync'
          ]
        })(result)
      })
    })
  })
})
