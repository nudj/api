/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.getOrCreateEmployment', () => {
  let db
  let result
  const operation = `
    query {
      person (id: "person1") {
        getOrCreateEmployment (
          company: "EMPLOYMENT_COMPANY",
          source: "EMPLOYMENT_SOURCE"
        ) {
          id
          source {
            id
            name
          }
          company {
            id
            name
          }
        }
      }
    }
  `

  describe('when company and source do not already exist in our data', () => {
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        companies: [],
        sources: [],
        employments: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should create the company', () => {
      return expect(db).to.have.deep.property('companies.0').to.deep.equal({
        id: 'company1',
        client: false,
        name: 'EMPLOYMENT_COMPANY'
      })
    })

    it('should create the source', () => {
      return expect(db).to.have.deep.property('sources.0').to.deep.equal({
        id: 'source1',
        name: 'EMPLOYMENT_SOURCE'
      })
    })

    it('should return the employment', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateEmployment')
        .to.deep.equal({
          id: 'employment1',
          source: {
            id: 'source1',
            name: 'EMPLOYMENT_SOURCE'
          },
          company: {
            id: 'company1',
            name: 'EMPLOYMENT_COMPANY'
          }
        })
    })
  })

  describe('when source already exists', () => {
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        sources: [{
          id: 'oldId',
          name: 'EMPLOYMENT_SOURCE'
        }],
        companies: [],
        employments: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a new source', () => {
      expect(db.sources.length).to.equal(1)
    })

    it('should return the existing source', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateEmployment.source')
        .to.deep.equal({
          id: 'oldId',
          name: 'EMPLOYMENT_SOURCE'
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
        sources: [],
        companies: [{
          id: 'oldId',
          name: 'EMPLOYMENT_COMPANY'
        }],
        employments: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a new company', () => {
      expect(db.companies.length).to.equal(1)
    })

    it('should return the existing company', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateEmployment.company')
        .to.deep.equal({
          id: 'oldId',
          name: 'EMPLOYMENT_COMPANY'
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
        sources: [{
          id: 'source1',
          name: 'linkedin'
        }],
        companies: [{
          id: 'company1',
          name: 'EMPLOYMENT_COMPANY'
        }],
        employments: [{
          id: 'oldId',
          person: 'person1',
          source: 'source1',
          company: 'company1'
        }]
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a new employments', () => {
      expect(db.employments.length).to.equal(1)
    })

    it('should return the existing employments', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateEmployment')
        .to.deep.equal({
          id: 'oldId',
          source: {
            id: 'source1',
            name: 'linkedin'
          },
          company: {
            id: 'company1',
            name: 'EMPLOYMENT_COMPANY'
          }
        })
    })
  })
})
