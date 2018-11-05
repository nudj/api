/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema, shouldRespondWithGqlError } = require('../../helpers')

const operation = `
  mutation UpdateIntegration($id: ID!, $data: Data!) {
    company (id: "company1") {
      updateIntegration (id: $id, data: $data) {
        id
      }
    }
  }
`

describe('Company.updateIntegration', () => {
  let variables
  let db

  beforeEach(() => {
    variables = {
      id: 'companyIntegration1',
      data: {
        apiKey: '456-PiddleDePicks'
      }
    }
    db = {
      companies: [{
        id: 'company1'
      }],
      companyIntegrations: [{
        id: 'companyIntegration1',
        data: {
          apiKey: '123-DohRayMe-SkiddleDeDee',
          user: 'Doctor Kalfresca Parchézi'
        }
      }]
    }
  })

  it('updates the integration', async () => {
    await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

    expect(db.companyIntegrations[0]).to.have.deep.property('data.apiKey', '456-PiddleDePicks')
  })

  it('returns the updated integration', async () => {
    const result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

    expect(result).to.have.deep.property('data.company.updateIntegration.id', 'companyIntegration1')
  })

  it('merges the provided data with existing data', async () => {
    await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

    expect(db.companyIntegrations[0]).to.have.property('data').to.deep.equal({
      apiKey: '456-PiddleDePicks',
      user: 'Doctor Kalfresca Parchézi'
    })
  })

  describe('when the companyIntegration does not exist', () => {
    let variables
    let db

    beforeEach(() => {
      variables = {
        id: 'companyIntegration30000000',
        data: {
          apiKey: '456-PiddleDePicks'
        }
      }
      db = {
        companies: [{
          id: 'company1'
        }]
      }
    })

    it('throws an error', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })

      shouldRespondWithGqlError({
        message: 'companyIntegration with id "companyIntegration30000000" does not exist',
        path: [ 'company', 'updateIntegration' ]
      })(result)
    })
  })
})
