/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation (
    $input: CompanyCreateInput!
  ) {
    createCompany(input: $input) {
      id
    }
  }
`
const variables = {
  input: {
    name: 'NudjV2',
    slug: 'nudj-v2',
    client: false
  }
}

describe('Mutation.createCompany', () => {
  let db

  beforeEach(() => {
    db = {
      companies: []
    }
  })

  it('should create the company', async () => {
    await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(db.companies[0]).to.deep.equal({
      id: 'company1',
      name: 'NudjV2',
      slug: 'nudj-v2',
      client: false
    })
  })

  it('return the new company', async () => {
    const result = await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
    expect(result)
      .to.have.deep.property('data.createCompany')
      .to.deep.equal({
        id: 'company1'
      })
  })
})
