/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  query {
    company (id: "company1") {
      integrationByFilters(filters: { type: "GREENHOUSE" }) {
        id
      }
    }
  }
`

describe('Company.integrationByFilters', () => {
  it('should fetch filtered integration', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      companyIntegrations: [
        {
          id: 'integration1',
          type: 'APPLE'
        },
        {
          id: 'integration2',
          type: 'APPLE'
        },
        {
          id: 'integration3',
          company: 'company1',
          type: 'GREENHOUSE'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        company: {
          integrationByFilters: {
            id: 'integration3'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      companyIntegrations: [
        {
          id: 'integration1',
          company: 'company1',
          type: 'TRUMPY_MC_TRUMPFACE'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        company: {
          integrationByFilters: null
        }
      }
    })
  })
})
