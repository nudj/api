/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { values: integrationTypes } = require('../../../../gql/schema/enums/company-integration-types')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

const operation = `
  mutation CreateIntegration($type: CompanyIntegrationType!, $data: Data!) {
    company (id: "company1") {
      createIntegration (type: $type, data: $data) {
        id
      }
    }
  }
`

describe.only('Company.createIntegration', () => {
  let variables
  let db

  beforeEach(() => {
    db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      companyIntegrations: []
    }
  })

  describe('when type is valid', () => {
    beforeEach(() => {
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

    describe('when a company integration already exists', () => {
      beforeEach(() => {
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
})
