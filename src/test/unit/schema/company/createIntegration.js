/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const orderBy = require('lodash/orderBy')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { values: integrationTypes } = require('../../../../gql/schema/enums/company-integration-types')
const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')
const { values: jobStatusTypes } = require('../../../../gql/schema/enums/job-status-types')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')
const { mockGreenhouseAPIRequests } = require('../../helpers/greenhouse/mock-requests')

const operation = `
  mutation CreateIntegration($type: CompanyIntegrationType!, $data: Data!) {
    company (id: "company1") {
      createIntegration (type: $type, data: $data) {
        id
      }
    }
  }
`

describe('Company.createIntegration', () => {
  let variables
  let db

  beforeEach(() => {
    db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      people: [{
        id: 'person1'
      }],
      hirers: [{
        id: 'hirer1',
        person: 'person1',
        company: 'company1',
        type: hirerTypes.ADMIN
      }],
      companyIntegrations: [],
      jobs: [
        { id: 'job1', company: 'company1', status: jobStatusTypes.PUBLISHED },
        { id: 'job2', company: 'company1', status: jobStatusTypes.PUBLISHED },
        { id: 'job3', company: 'company2', status: jobStatusTypes.ARCHIVED },
        { id: 'job4', company: 'company1', status: jobStatusTypes.ARCHIVED }
      ]
    }
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('when type is valid', () => {
    beforeEach(() => {
      mockGreenhouseAPIRequests()
      variables = {
        type: integrationTypes.GREENHOUSE,
        data: {
          user: 'trump@bing.com',
          this_is_a_specific_key_needed_for_this_integration: 'creamy_fish',
          no_way: 'folks',
          leaderOfTheFreeWorld: true,
          bing_bing_bong_bong: ['You', 'know', 'what', 'this', 'is', 'right?']
        }
      }
    })

    it('accepts a generic data object of integration info', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

      expect(result).to.not.have.deep.property('errors')
      expect(db.companyIntegrations[0]).to.have.property('data')
    })

    it('creates the integration', async () => {
      await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

      const newIntegration = db.companyIntegrations[0]
      expect(newIntegration).to.have.property('type', integrationTypes.GREENHOUSE)
      expect(newIntegration).to.have.property('company', 'company1')
      expect(newIntegration).to.have.property('data').to.deep.equal({
        user: 'trump@bing.com',
        this_is_a_specific_key_needed_for_this_integration: 'creamy_fish',
        no_way: 'folks',
        leaderOfTheFreeWorld: true,
        bing_bing_bong_bong: ['You', 'know', 'what', 'this', 'is', 'right?']
      })
    })

    it('returns the newly created integration', async () => {
      const { data: result } = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

      expect(result).to.have.deep.property('company.createIntegration.id', 'companyIntegration1')
    })

    it('sets the type as the value for the `Company.ats` field', async () => {
      await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

      expect(db.companies[0]).to.have.property('ats', integrationTypes.GREENHOUSE)
    })

    it('updates existing jobs to have `status` value of `BACKUP`', async () => {
      await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      const jobs = orderBy(db.jobs, ['company'])

      expect(jobs[0]).to.have.property('status', jobStatusTypes.BACKUP)
      expect(jobs[1]).to.have.property('status', jobStatusTypes.BACKUP)
      expect(jobs[2]).to.have.property('status', jobStatusTypes.BACKUP)
      expect(jobs[3]).to.have.property('status', jobStatusTypes.ARCHIVED)
    })

    describe('when a company integration already exists', () => {
      beforeEach(() => {
        mockGreenhouseAPIRequests()
        db = {
          companies: [
            {
              id: 'company1'
            }
          ],
          companyIntegrations: [{
            id: 'companyIntegration1',
            company: 'company1',
            type: 'TRUMP_ATS'
          }]
        }
        variables = {
          type: integrationTypes.GREENHOUSE,
          data: {
            this_is_a_specific_key_needed_for_this_integration: 'creamy_fish',
            no_way: 'folks',
            leaderOfTheFreeWorld: true,
            bing_bing_bong_bong: ['You', 'know', 'what', 'this', 'is', 'right?']
          }
        }
      })

      it('throws an error', async () => {
        const result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

        shouldRespondWithGqlError({
          message: 'Company already has an integration of type "TRUMP_ATS"',
          path: ['company', 'createIntegration']
        })(result)
      })

      it('does not create the integration', async () => {
        await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

        expect(db.companyIntegrations).to.have.property('length', 1)
      })
    })
  })

  describe('when type is invalid', () => {
    beforeEach(() => {
      mockGreenhouseAPIRequests()
      variables = {
        type: 'TRUMP',
        data: {
          this_is_a_specific_key_needed_for_this_integration: 'creamy_fish',
          no_way: 'folks',
          leaderOfTheFreeWorld: true,
          bing_bing_bong_bong: ['You', 'know', 'what', 'this', 'is', 'right?']
        }
      }
    })

    it('throws an error', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

      shouldRespondWithGqlError({
        message: 'Variable "$type" got invalid value "TRUMP".\nExpected type "CompanyIntegrationType", found "TRUMP".'
      })(result)
    })
  })

  describe('when verification fails', () => {
    beforeEach(() => {
      nock('https://harvest.greenhouse.io')
        .get('/v1/job_posts')
        .query(() => true)
        .reply(200)
      nock('https://harvest.greenhouse.io')
        .get('/v1/jobs')
        .query(() => true)
        .reply(200)
      nock('https://api.greenhouse.io')
        .get('/v1/partner/current_user')
        .query(() => true)
        .reply(401, {
          message: 'Invalid Basic Auth credentials'
        })

      variables = {
        type: integrationTypes.GREENHOUSE,
        data: {
          user: 'trump@bing.com',
          this_is_a_specific_key_needed_for_this_integration: 'creamy_fish',
          no_way: 'folks',
          leaderOfTheFreeWorld: true,
          bing_bing_bong_bong: ['You', 'know', 'what', 'this', 'is', 'right?']
        }
      }
    })

    it('throws an error', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

      shouldRespondWithGqlError({
        message: 'Verification failed',
        path: [ 'company', 'createIntegration' ]
      })(result)
    })
  })
})
