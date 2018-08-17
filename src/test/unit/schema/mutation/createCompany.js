/* eslint-env mocha */
const orderBy = require('lodash/orderBy')
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

      expect(db.companies[0]).to.have.property('id', 'company1')
      expect(db.companies[0]).to.have.property('name', 'NudjV2')
      expect(db.companies[0]).to.have.property('slug', 'nudj-v-2')
      expect(db.companies[0]).to.have.property('onboarded', false)
      expect(db.companies[0]).to.have.property('client', false)
      expect(db.companies[0]).to.have.property('hash').to.match(/[a-z0-9]{128}/)
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
            slug: 'nudj-v-2'
          }
        ]
      }
    })

    it('should generate a new unique slug', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      const companies = orderBy(db.companies, 'id')
      expect(companies[0]).to.have.property('slug', 'nudj-v-2')
      expect(companies[1]).to.have.property('slug').to.not.equal('nudj-v-2')
      expect(companies[1]).to.have.property('slug').to.match(/nudj-v-2-[a-zA-Z0-9]{8}/)
    })

    it('should create the company', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      const companies = orderBy(db.companies, 'id')
      expect(companies.length).to.equal(2)
      expect(companies[1]).to.have.property('id').to.equal('company2')
    })
  })

  describe('when the name is not unique', () => {
    const existingCompanyVariables = {
      company: {
        name: 'gavin corp',
        slug: 'gavin-corp',
        client: true
      }
    }

    beforeEach(() => {
      db = {
        companies: [
          {
            id: 'company1',
            name: 'Gavin Corp',
            onboarded: false,
            client: true,
            slug: 'gavin-corp'
          }
        ]
      }
    })

    it('should throw an error', async () => {
      const result = await executeQueryOnDbUsingSchema({
        operation,
        variables: existingCompanyVariables,
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
        variables: existingCompanyVariables,
        db,
        schema
      })
      expect(db.companies.length).to.equal(1)
      expect(db.companies[0]).to.have.property('id').to.equal('company1')
    })
  })
})
