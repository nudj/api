/* eslint-env mocha */
const chai = require('chai')

const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')
const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

const expect = chai.expect

describe('Person.addCompanyAndAssignUserAsHirer', async () => {
  const operation = `
    query testQuery ($companyData: CompanyCreateInput!) {
      user {
        addCompanyAndAssignUserAsHirer(company: $companyData) {
          id
        }
      }
    }
  `
  const baseDb = {
    people: [
      {
        id: 'person1'
      }
    ]
  }
  const variables = {
    companyData: {
      name: 'Fake Company',
      location: 'Fakeland',
      description: 'Fake it til you make it',
      client: true
    }
  }

  describe('when company exists', async () => {
    describe('when user is a hirer for the company', async () => {
      it('returns the hirer', async () => {
        const db = {
          ...baseDb,
          companies: [
            {
              id: 'company1',
              name: 'Fake Company'
            }
          ],
          hirers: [
            {
              id: 'hirer1',
              person: 'person1',
              company: 'company1'
            }
          ]
        }

        const result = await executeQueryOnDbUsingSchema({
          operation,
          db,
          schema,
          variables
        })

        expect(result.data).to.deep.equal({
          user: {
            addCompanyAndAssignUserAsHirer: {
              id: 'hirer1'
            }
          }
        })
      })

      it('does not create a hirer', async () => {
        const db = {
          ...baseDb,
          companies: [
            {
              id: 'company1',
              name: 'Fake Company'
            }
          ],
          hirers: [
            {
              id: 'hirer1',
              person: 'person1',
              company: 'company1'
            }
          ]
        }

        await executeQueryOnDbUsingSchema({
          operation,
          db,
          schema,
          variables
        })

        expect(db.hirers.length).to.equal(1)
        expect(db.hirers).to.deep.equal([
          {
            id: 'hirer1',
            person: 'person1',
            company: 'company1'
          }
        ])
      })

      it('does not create a company', async () => {
        const db = {
          ...baseDb,
          companies: [
            {
              id: 'company1',
              name: 'Fake Company'
            }
          ],
          hirers: [
            {
              id: 'hirer1',
              person: 'person1',
              company: 'company1'
            }
          ]
        }

        await executeQueryOnDbUsingSchema({
          operation,
          db,
          schema,
          variables
        })

        expect(db.companies.length).to.equal(1)
        expect(db.companies).to.deep.equal([
          {
            id: 'company1',
            name: 'Fake Company'
          }
        ])
      })
    })

    describe('when user is not a hirer for the company', async () => {
      it('does not create a hirer', async () => {
        const db = {
          ...baseDb,
          companies: [
            {
              id: 'company1',
              name: 'Fake Company'
            }
          ],
          hirers: []
        }

        await executeQueryOnDbUsingSchema({
          operation,
          db,
          schema,
          variables
        })

        expect(db.hirers.length).to.equal(0)
      })

      it('throws an error', async () => {
        const db = {
          ...baseDb,
          companies: [
            {
              id: 'company1',
              name: 'Fake Company'
            }
          ],
          hirers: []
        }

        const result = await executeQueryOnDbUsingSchema({
          operation,
          db,
          schema,
          variables
        })

        shouldRespondWithGqlError({
          path: ['user', 'addCompanyAndAssignUserAsHirer']
        })(result)
      })
    })
  })

  describe('when company does not exist', async () => {
    it('creates the company', async () => {
      const db = {
        ...baseDb,
        companies: [],
        hirers: []
      }

      await executeQueryOnDbUsingSchema({
        operation,
        db,
        schema,
        variables
      })

      expect(db.companies.length).to.equal(1)
      expect(db.companies).to.deep.equal([
        {
          id: 'company1',
          name: 'Fake Company',
          location: 'Fakeland',
          description: 'Fake it til you make it',
          slug: 'fake-company',
          client: true,
          onboarded: false
        }
      ])
    })

    it('creates a unique company slug', async () => {
      const troubleSlug = 'fake-company'
      const db = {
        ...baseDb,
        companies: [
          {
            id: 'company50210',
            name: 'Faké Compañy',
            slug: troubleSlug
          }
        ],
        hirers: []
      }

      await executeQueryOnDbUsingSchema({
        operation,
        db,
        schema,
        variables
      })

      const generatedSlug = db.companies[1].slug

      expect(generatedSlug).to.be.a('string')
      expect(generatedSlug).to.include(troubleSlug)
      expect(generatedSlug).to.not.equal(troubleSlug)
    })

    it('creates the hirer', async () => {
      const db = {
        ...baseDb,
        companies: [],
        hirers: []
      }

      await executeQueryOnDbUsingSchema({
        operation,
        db,
        schema,
        variables
      })

      expect(db.hirers.length).to.equal(1)
      expect(db.hirers).to.deep.equal([
        {
          id: 'hirer1',
          company: 'company1',
          person: 'person1',
          onboarded: false,
          type: hirerTypes.ADMIN
        }
      ])
    })

    it('returns the hirer', async () => {
      const db = {
        ...baseDb,
        companies: [],
        hirers: []
      }

      const result = await executeQueryOnDbUsingSchema({
        operation,
        db,
        schema,
        variables
      })

      expect(result.data).to.deep.equal({
        user: {
          addCompanyAndAssignUserAsHirer: {
            id: 'hirer1'
          }
        }
      })
    })
  })
})
