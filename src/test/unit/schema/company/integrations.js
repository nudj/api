/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    companies {
      integrations {
        id
      }
    }
  }
`
const baseData = {
  companies: [{
    id: 'company1'
  }]
}

describe('Company.integrations', () => {
  it('should fetch all integrations relating to the company', async () => {
    const db = merge(baseData, {
      companyIntegrations: [
        {
          id: 'integration1',
          company: 'company1'
        },
        {
          id: 'integration2',
          company: 'company1'
        },
        {
          id: 'integration3',
          company: 'company2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            integrations: [
              {
                id: 'integration1'
              },
              {
                id: 'integration2'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      companyIntegrations: [
        {
          id: 'integration1',
          company: 'company2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            integrations: []
          }
        ]
      }
    })
  })
})
