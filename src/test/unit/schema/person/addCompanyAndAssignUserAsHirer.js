/* eslint-env mocha */
const chai = require('chai')
const find = require('lodash/find')

const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')
const { values: dataSources } = require('../../../../gql/schema/enums/data-sources')
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
          ],
          employments: []
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
          ],
          employments: []
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
          ],
          employments: []
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
      describe('when the company is a client', async () => {
        it('does not create a hirer', async () => {
          const db = {
            ...baseDb,
            companies: [
              {
                id: 'company1',
                client: true,
                name: 'Fake Company'
              }
            ],
            hirers: [],
            employments: []
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
                client: true,
                name: 'Fake Company'
              }
            ],
            hirers: [],
            employments: []
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

      describe('when the company is not a client', async () => {
        it('creates a hirer', async () => {
          const db = {
            ...baseDb,
            companies: [
              {
                id: 'company1',
                client: false,
                name: 'Fake Company'
              }
            ],
            hirers: [],
            employments: []
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
              onboarded: false,
              company: 'company1',
              type: hirerTypes.ADMIN
            }
          ])
        })

        it('creates an employment', async () => {
          const db = {
            ...baseDb,
            companies: [
              {
                id: 'company1',
                client: false,
                name: 'Fake Company'
              }
            ],
            hirers: [],
            employments: []
          }

          await executeQueryOnDbUsingSchema({
            operation,
            db,
            schema,
            variables
          })

          expect(db.employments.length).to.equal(1)
          expect(db.employments).to.deep.equal([
            {
              id: 'employment1',
              person: 'person1',
              company: 'company1',
              current: true,
              source: dataSources.NUDJ
            }
          ])
        })

        it('updates the company as a client', async () => {
          const db = {
            ...baseDb,
            companies: [
              {
                id: 'company1',
                client: false,
                name: 'Fake Company'
              }
            ],
            hirers: [],
            employments: []
          }

          await executeQueryOnDbUsingSchema({
            operation,
            db,
            schema,
            variables
          })

          expect(db.companies[0]).to.have.property('name').to.equal('Fake Company')
          expect(db.companies[0]).to.have.property('client').to.be.true()
        })
      })
    })
  })

  describe('when company does not exist', async () => {
    describe('when a current employment exists', () => {
      describe('when employed with a different company', () => {
        it('updates the current employment to `current: false`', async () => {
          const db = {
            ...baseDb,
            companies: [
              {
                id: 'company1',
                client: false,
                name: 'Fake Company'
              }
            ],
            hirers: [],
            employments: [
              {
                id: 'employment1',
                person: 'person1',
                company: 'company2',
                current: true
              }
            ]
          }

          await executeQueryOnDbUsingSchema({
            operation,
            db,
            schema,
            variables
          })

          const oldEmployment = find(db.employments, { company: 'company2' })

          expect(oldEmployment).to.have.property('current').to.be.false()
        })

        it('creates an employment', async () => {
          const db = {
            ...baseDb,
            companies: [
              {
                id: 'company1',
                client: false,
                name: 'Fake Company'
              }
            ],
            hirers: [],
            employments: [
              {
                id: 'employment1',
                person: 'person1',
                company: 'company2',
                current: true
              }
            ]
          }

          await executeQueryOnDbUsingSchema({
            operation,
            db,
            schema,
            variables
          })

          const newEmployment = find(db.employments, { id: 'employment2' })

          expect(db.employments.length).to.equal(2)
          expect(newEmployment).to.have.property('current').to.be.true()
        })
      })

      describe('when employed with the same company', () => {
        it('does not create an employment', async () => {
          const db = {
            ...baseDb,
            companies: [
              {
                id: 'company1',
                client: false,
                name: 'Fake Company'
              }
            ],
            hirers: [],
            employments: [
              {
                id: 'employment1',
                person: 'person1',
                company: 'company1',
                current: true
              }
            ]
          }

          await executeQueryOnDbUsingSchema({
            operation,
            db,
            schema,
            variables
          })

          expect(db.employments.length).to.equal(1)
        })
      })
    })

    describe('when a current employment does not exist', () => {
      it('creates an employment', async () => {
        const db = {
          ...baseDb,
          companies: [
            {
              id: 'company1',
              client: false,
              name: 'Fake Company'
            }
          ],
          hirers: [],
          employments: []
        }

        await executeQueryOnDbUsingSchema({
          operation,
          db,
          schema,
          variables
        })

        expect(db.employments.length).to.equal(1)
        expect(db.employments).to.deep.equal([
          {
            id: 'employment1',
            person: 'person1',
            company: 'company1',
            current: true,
            source: dataSources.NUDJ
          }
        ])
      })
    })
    it('creates the company', async () => {
      const db = {
        ...baseDb,
        companies: [],
        hirers: [],
        employments: []
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
        hirers: [],
        employments: []
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
        hirers: [],
        employments: []
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
        hirers: [],
        employments: []
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
