/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')
const mockClearbitRequests = require('../../helpers/clearbit/mock-requests')

const operation = `
  mutation (
    $company: CompanyCreateInput!
  ) {
    createCompany(company: $company) {
      id
    }
  }
`
const variables = {
  company: {
    name: 'NudjV2',
    slug: 'nudj-v2',
    client: false
  }
}

describe('Mutation.createCompany', () => {
  let db

  before(() => {
    mockClearbitRequests()
  })

  after(() => {
    nock.cleanAll()
  })

  describe('when the slug is unique', () => {
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
        onboarded: false,
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

  describe('when the slug is not unique', () => {
    beforeEach(() => {
      db = {
        companies: [
          {
            id: 'company1',
            name: 'Nudj V2',
            onboarded: false,
            slug: 'nudj-v2'
          }
        ]
      }
    })

    it('should throw an error', async () => {
      const result = await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      shouldRespondWithGqlError({
        path: [
          'createCompany'
        ]
      })(result)
    })

    it('should not create the company', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.companies.length).to.equal(1)
      expect(db.companies[0]).to.have.property('id').to.equal('company1')
    })
  })
})
