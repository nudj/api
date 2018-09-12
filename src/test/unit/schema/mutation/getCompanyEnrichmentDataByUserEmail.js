/* eslint-env mocha */
const nock = require('nock')
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const mockClearbitRequests = require('../../helpers/clearbit/mock-requests')

const operation = `
  mutation {
    getCompanyEnrichmentDataByUserEmail
  }
`

xdescribe('Mutation.getCompanyEnrichmentDataByUserEmail', () => {
  let cachedClearbitStatus

  before(() => {
    cachedClearbitStatus = process.env.CLEARBIT_ENABLED
    process.env.CLEARBIT_ENABLED = 'true'
  })

  after(() => {
    process.env.CLEARBIT_ENABLED = cachedClearbitStatus
  })

  describe('when the domain is within the blacklist', () => {
    before(() => {
      mockClearbitRequests()
    })

    after(() => {
      nock.cleanAll()
    })

    it('returns `null` for `company` and `enrichedCompany`', async () => {
      const result = await executeQueryOnDbUsingSchema({
        operation,
        db: {
          people: [{
            id: 'person1',
            email: 'ceo@comcast.net'
          }],
          companies: []
        },
        nosql: {
          enrichedCompanies: []
        },
        schema
      })

      expect(result.data.getCompanyEnrichmentDataByUserEmail).to.deep.equal({
        company: null,
        enrichedCompany: null
      })
    })
    it('logs to the console', async () => {})
  })

  describe('when domain isn\'t in the blacklist', () => {
    describe('and the enrichment is successful', () => {
      before(() => {
        mockClearbitRequests([
          200,
          {
            id: 'example',
            name: 'TIM.F-R',
            legalName: null,
            domain: 'tim.fr'
          }
        ])
      })

      after(() => {
        nock.cleanAll()
      })

      it('returns the data', async () => {
        const result = await executeQueryOnDbUsingSchema({
          operation,
          db: {
            people: [{
              id: 'person1',
              email: 'ceo@tim.fr'
            }],
            companies: []
          },
          nosql: {
            enrichedCompanies: []
          },
          schema
        })

        /**
         * The Clearbit API returns a bespoke `Resource` class, so object
         * comparisons don't work as expected.
         */
        const enrichedCompanyObject = JSON.parse(
          JSON.stringify(result.data.getCompanyEnrichmentDataByUserEmail.enrichedCompany)
        )

        expect(result.data.getCompanyEnrichmentDataByUserEmail.company).to.be.null()

        expect(enrichedCompanyObject).to.deep.equal({
          options: {},
          id: 'example',
          name: 'TIM.F-R',
          legalName: null,
          domain: 'tim.fr'
        })
      })
    })

    describe('and the enrichment fails', async () => {
      before(() => {
        mockClearbitRequests([
          422,
          {
            'error': {
              'type': 'domain_invalid',
              'message': 'Invalid DNS for domain: \'tim.fr\''
            }
          }])
      })

      after(() => {
        nock.cleanAll()
      })

      it('returns `null` objects', async () => {
        const result = await executeQueryOnDbUsingSchema({
          operation,
          db: {
            people: [{
              id: 'person1',
              email: 'ceo@tim.fr'
            }],
            companies: []
          },
          nosql: {
            enrichedCompanies: []
          },
          schema
        })

        expect(result.data.getCompanyEnrichmentDataByUserEmail).to.deep.equal({
          company: null,
          enrichedCompany: null
        })
      })
    })
  })
})
