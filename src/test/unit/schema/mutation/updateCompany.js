/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.updateCompany', () => {
  describe('when the slug is unique', () => {
    it('should update the company data', () => {
      const db = {
        companies: [
          {
            id: 'company1',
            name: 'Dave & Sons',
            slug: 'dave-and-sons'
          }
        ]
      }

      const operation = `
        mutation UpdateDaveCompany ($companyData: CompanyUpdateInput!) {
          updateCompany(
            id: "company1",
            companyUpdate: $companyData
          ) {
            id
            name
          }
        }
      `

      const variables = {
        companyData: {
          name: 'Just Dave Now'
        }
      }

      return executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      }).then(() => {
        return expect(db.companies[0]).to.deep.equal({
          id: 'company1',
          name: 'Just Dave Now',
          slug: 'dave-and-sons'
        })
      })
    })

    it('should return the updated company', async () => {
      const db = {
        companies: [
          {
            id: 'company1',
            name: 'Dave & Sons',
            slug: 'dave-and-sons'
          }
        ]
      }

      const operation = `
        mutation UpdateDaveCompany ($companyData: CompanyUpdateInput!) {
          updateCompany(
            id: "company1",
            companyUpdate: $companyData
          ) {
            id
            name
          }
        }
      `

      const variables = {
        companyData: {
          name: 'Just Dave Now'
        }
      }

      const { data } = await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })

      expect(data.updateCompany).to.have.property('id').to.deep.equal('company1')
      expect(data.updateCompany).to.have.property('name').to.deep.equal('Just Dave Now')
    })
  })

  describe('when the slug is not unique', () => {
    let db

    beforeEach(() => {
      db = {
        companies: [
          {
            id: 'company1',
            name: 'DaveCorp',
            slug: 'dave-slug'
          },
          {
            id: 'company2',
            name: 'Dave & Sons',
            slug: 'dave-and-sons'
          }
        ]
      }
    })

    const operation = `
      mutation UpdateDaveCompany ($companyData: CompanyUpdateInput!) {
        updateCompany(
          id: "company2",
          companyUpdate: $companyData
        ) {
          id
          name
        }
      }
    `

    const variables = {
      companyData: {
        slug: 'dave-slug'
      }
    }

    it('should throw error', async () => {
      const result = await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      shouldRespondWithGqlError({
        path: [
          'updateCompany'
        ]
      })(result)
    })

    it('should not update the company', async () => {
      await executeQueryOnDbUsingSchema({
        operation,
        variables,
        db,
        schema
      })
      expect(db.companies[1]).to.have.property('id').to.equal('company2')
      expect(db.companies[1]).to.have.property('slug').to.equal('dave-and-sons')
    })
  })
})
