/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')
const DataSources = require('../../../../gql/schema/enums/data-sources')

describe('Person.getOrCreateEmployment', () => {
  let db
  let result
  const operation = `
    query getOrCreateEmployment (
      $company: String!,
      $source: DataSource!
    ) {
      person (id: "person1") {
        getOrCreateEmployment (
          company: $company,
          source: $source
        ) {
          id
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
        return expect(db).to.have.deep.property('companies.0').to.deep.equal({
          id: 'company1',
          client: false,
          onboarded: false,
          slug: 'employment_company',
          name: 'EMPLOYMENT_COMPANY'
        })
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
        path: ['person', 'getOrCreateEmployment'],
        message: 'Please pass a company string'
      })(result)
    })
  })
})
