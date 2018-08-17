/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const find = require('lodash/find')

const { values: hirerTypes } = require('../../../../gql/schema/enums/hirer-types')
const schema = require('../../../../gql/schema')
const { values: jobStatusTypes } = require('../../../../gql/schema/enums/job-status-types')
const mockPrismicRequests = require('../../helpers/prismic/mock-requests')
const { DUMMY_APPLICANT_EMAIL_ADDRESS } = require('../../../../gql/lib/constants')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

const expect = chai.expect
const prismicStub = sinon.stub()

describe('Person.addCompanyAndAssignUserAsHirer', async () => {
  beforeEach(() => {
    prismicStub.reset()
    mockPrismicRequests(prismicStub)
  })

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
    applications: [],
    jobs: [],
    people: [{
      id: 'person1',
      email: DUMMY_APPLICANT_EMAIL_ADDRESS
    }]
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
                client: true,
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

      describe('when the company is not a client', async () => {
        it('creates a hirer', async () => {
          const db = {
            ...baseDb,
            employments: [],
            companies: [
              {
                id: 'company1',
                client: false,
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
            hirers: []
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
      expect(db.companies[0]).to.have.property('id', 'company1')
      expect(db.companies[0]).to.have.property('name', 'Fake Company')
      expect(db.companies[0]).to.have.property('location', 'Fakeland')
      expect(db.companies[0]).to.have.property('description', 'Fake it til you make it')
      expect(db.companies[0]).to.have.property('slug', 'fake-company')
      expect(db.companies[0]).to.have.property('client', true)
      expect(db.companies[0]).to.have.property('onboarded', false)
      expect(db.companies[0]).to.have.property('hash').to.match(/[a-z0-9]{128}/)
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
        employments: [],
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
        employments: [],
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

    it('creates a dummy data job for the company', async () => {
      const db = {
        ...baseDb,
        applications: [],
        jobs: [],
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
      const company = db.companies[0]

      expect(db.jobs.length).to.equal(1)
      expect(db.jobs[0]).to.have.property('description')
      expect(db.jobs[0]).to.have.property('title')
      expect(db.jobs[0]).to.have.property('bonus')
      expect(db.jobs[0]).to.have.property('location')
      expect(db.jobs[0]).to.have.property('slug')
      expect(db.jobs[0]).to.have.property('company', company.id)
      expect(db.jobs[0]).to.have.property('status', jobStatusTypes.DRAFT)
    })

    it('creates a dummy data application for the company', async () => {
      const db = {
        ...baseDb,
        applications: [],
        jobs: [],
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
      const job = db.jobs[0]
      const dummyPerson = find(db.people, { email: DUMMY_APPLICANT_EMAIL_ADDRESS })

      expect(db.applications.length).to.equal(1)
      expect(db.applications[0]).to.have.property('person', dummyPerson.id)
      expect(db.applications[0]).to.have.property('job', job.id)
    })
  })
})
