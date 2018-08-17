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
const DataSources = require('../../../../gql/schema/enums/data-sources')

describe('Person.getOrCreateEmployment', () => {
  before(() => {
    mockClearbitRequests()
  })

  after(() => {
    nock.cleanAll()
  })

  let db
  let result
  const operation = `
    query getOrCreateEmployment (
      $company: String!,
      $current: Boolean!,
      $source: DataSource!
    ) {
      person (id: "person1") {
        getOrCreateEmployment (
          company: $company,
          current: $current,
          source: $source
        ) {
          id
          current
          company {
            id
            name
            slug
          }
          source
        }
      }
    }
  `

  describe('when valid data is provided', () => {
    const variables = {
      company: 'EMPLOYMENT_COMPANY',
      current: true,
      source: DataSources.values.LINKEDIN
    }

    describe('when company does not already exist in our data', () => {
      beforeEach(async () => {
        db = {
          people: [
            {
              id: 'person1'
            }
          ],
          companies: [],
          employments: []
        }
        result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      })

      it('should create the company', () => {
        expect(db.companies[0]).to.have.property('id', 'company1')
        expect(db.companies[0]).to.have.property('client', false)
        expect(db.companies[0]).to.have.property('onboarded', false)
        expect(db.companies[0]).to.have.property('slug', 'employment_company')
        expect(db.companies[0]).to.have.property('name', 'EMPLOYMENT_COMPANY')
        expect(db.companies[0]).to.have.property('hash').to.match(/[a-z0-9]{128}/)
      })

      it('should return the employment', () => {
        return expect(result)
          .to.have.deep.property('data.person.getOrCreateEmployment')
          .to.deep.equal({
            id: 'employment1',
            company: {
              id: 'company1',
              slug: 'employment_company',
              name: 'EMPLOYMENT_COMPANY'
            },
            current: true,
            source: DataSources.values.LINKEDIN
          })
      })
    })

    describe('when company already exists', () => {
      beforeEach(async () => {
        db = {
          people: [
            {
              id: 'person1'
            }
          ],
          companies: [{
            id: 'a08491cb2f97756f0413f121ae818846',
            name: 'EMPLOYMENT_COMPANY',
            slug: 'employment_company'
          }],
          employments: []
        }
        result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      })

      it('should not create a new company', () => {
        expect(db.companies.length).to.equal(1)
      })

      it('should return the existing company', () => {
        return expect(result)
          .to.have.deep.property('data.person.getOrCreateEmployment.company')
          .to.deep.equal({
            id: 'a08491cb2f97756f0413f121ae818846',
            name: 'EMPLOYMENT_COMPANY',
            slug: 'employment_company'
          })
      })
    })

    describe('when employment already exists', () => {
      beforeEach(async () => {
        db = {
          people: [
            {
              id: 'person1'
            }
          ],
          companies: [{
            id: 'a08491cb2f97756f0413f121ae818846',
            name: 'EMPLOYMENT_COMPANY',
            slug: 'employment_company'
          }],
          employments: [{
            id: 'oldId',
            person: 'person1',
            current: true,
            company: 'a08491cb2f97756f0413f121ae818846',
            source: DataSources.values.LINKEDIN
          }]
        }
        result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      })

      it('should not create a new employment', () => {
        expect(db.employments.length).to.equal(1)
      })

      it('should return the existing employment', () => {
        return expect(result)
          .to.have.deep.property('data.person.getOrCreateEmployment')
          .to.deep.equal({
            id: 'oldId',
            company: {
              id: 'a08491cb2f97756f0413f121ae818846',
              name: 'EMPLOYMENT_COMPANY',
              slug: 'employment_company'
            },
            current: true,
            source: DataSources.values.LINKEDIN
          })
      })

      it('should return the existing company', () => {
        return expect(result)
          .to.have.deep.property('data.person.getOrCreateEmployment.company')
          .to.deep.equal({
            id: 'a08491cb2f97756f0413f121ae818846',
            name: 'EMPLOYMENT_COMPANY',
            slug: 'employment_company'
          })
      })
    })
  })

  describe('when company is an empty string', () => {
    const variables = {
      company: '',
      current: false,
      source: DataSources.values.LINKEDIN
    }
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        companies: [],
        employments: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should not create the company', () => {
      return expect(db).to.have.deep.property('companies').to.be.empty()
    })

    it('should respond with error', () => {
      return shouldRespondWithGqlError({
        path: ['person', 'getOrCreateEmployment']
      })(result)
    })
  })
})
