/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.getOrCreateConnection', () => {
  let db
  let result
  let operation = `
    query {
      person (id: "person1") {
        getOrCreateConnection(
          to: {
            firstName: "CONNECTION_FIRSTNAME",
            lastName: "CONNECTION_LASTNAME",
            title: "CONNECTION_TITLE",
            company: "CONNECTION_COMPANY",
            email: "CONNECTION_EMAIL"
          },
          source: {
            name: "CONNECTION_SOURCE"
          }
        ) {
          id
          firstName
          lastName
          role {
            id
            name
          }
          company {
            id
            name
          }
          source {
            id
            name
          }
          person {
            id
            email
          }
        }
      }
    }
  `

  describe('when new sources, roles, companies and people are given', () => {
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        sources: [],
        roles: [],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should create the source', () => {
      return expect(db).to.have.deep.property('sources.0').to.deep.equal({
        id: 'source1',
        name: 'CONNECTION_SOURCE'
      })
    })

    it('should create the role', () => {
      return expect(db).to.have.deep.property('roles.0').to.deep.equal({
        id: 'role1',
        name: 'CONNECTION_TITLE'
      })
    })

    it('should create the company', () => {
      return expect(db).to.have.deep.property('companies.0').to.deep.equal({
        id: 'company1',
        client: false,
        name: 'CONNECTION_COMPANY'
      })
    })

    it('should create the person', () => {
      return expect(db).to.have.deep.property('people.1').to.deep.equal({
        company: 'CONNECTION_COMPANY',
        email: 'CONNECTION_EMAIL',
        firstName: 'CONNECTION_FIRSTNAME',
        id: 'person2',
        lastName: 'CONNECTION_LASTNAME',
        title: 'CONNECTION_TITLE'
      })
    })

    it('should return the connection', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnection')
        .to.deep.equal({
          id: 'connection1',
          firstName: 'CONNECTION_FIRSTNAME',
          lastName: 'CONNECTION_LASTNAME',
          role: {
            id: 'role1',
            name: 'CONNECTION_TITLE'
          },
          company: {
            id: 'company1',
            name: 'CONNECTION_COMPANY'
          },
          source: {
            id: 'source1',
            name: 'CONNECTION_SOURCE'
          },
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
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
          name: 'CONNECTION_SOURCE'
        }],
        roles: [],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a new source', () => {
      expect(db.sources.length).to.equal(1)
    })

    it('should return the existing source', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnection.source')
        .to.deep.equal({
          id: 'oldId',
          name: 'CONNECTION_SOURCE'
        })
    })
  })

  describe('when role already exists', () => {
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        sources: [],
        roles: [{
          id: 'oldId',
          name: 'CONNECTION_TITLE'
        }],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a new role', () => {
      expect(db.roles.length).to.equal(1)
    })

    it('should return the existing role', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnection.role')
        .to.deep.equal({
          id: 'oldId',
          name: 'CONNECTION_TITLE'
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
        roles: [],
        companies: [{
          id: 'oldId',
          name: 'CONNECTION_COMPANY'
        }],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a new company', () => {
      expect(db.companies.length).to.equal(1)
    })

    it('should return the existing company', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnection.company')
        .to.deep.equal({
          id: 'oldId',
          name: 'CONNECTION_COMPANY'
        })
    })
  })

  describe('when person already exists', () => {
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          },
          {
            id: 'oldId',
            email: 'CONNECTION_EMAIL'
          }
        ],
        sources: [],
        roles: [],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a new person', () => {
      expect(db.people.length).to.equal(2)
    })

    it('should return the existing person', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnection.person')
        .to.deep.equal({
          id: 'oldId',
          email: 'CONNECTION_EMAIL'
        })
    })
  })

  describe('when connection already exists', () => {
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
          }
        ],
        sources: [{
          id: 'source1',
          name: 'linkedin'
        }],
        roles: [{
          id: 'role1',
          name: 'Sales Manager'
        }],
        companies: [{
          id: 'company1',
          name: 'nudj'
        }],
        connections: [{
          id: 'oldId',
          firstName: 'Bob',
          lastName: 'Johnson',
          from: 'person1',
          person: 'person2',
          source: 'source1',
          role: 'role1',
          company: 'company1'
        }]
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a new connection', () => {
      expect(db.connections.length).to.equal(1)
    })

    it('should return the existing connection', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnection')
        .to.deep.equal({
          id: 'oldId',
          firstName: 'Bob',
          lastName: 'Johnson',
          role: {
            id: 'role1',
            name: 'Sales Manager'
          },
          company: {
            id: 'company1',
            name: 'nudj'
          },
          source: {
            id: 'source1',
            name: 'linkedin'
          },
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
          }
        })
    })
  })

  describe('when title is not given', () => {
    beforeEach(async () => {
      operation = `
        query {
          person (id: "person1") {
            getOrCreateConnection(
              to: {
                firstName: "CONNECTION_FIRSTNAME",
                lastName: "CONNECTION_LASTNAME",
                company: "CONNECTION_COMPANY",
                email: "CONNECTION_EMAIL"
              },
              source: {
                name: "CONNECTION_SOURCE"
              }
            ) {
              id
              firstName
              lastName
              role {
                id
                name
              }
              company {
                id
                name
              }
              source {
                id
                name
              }
              person {
                id
                email
              }
            }
          }
        }
      `
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        sources: [],
        roles: [
          {
            id: 'role1',
            name: 'Test role'
          }
        ],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a role', () => {
      return expect(db.roles).to.have.length(1)
    })

    it('should set the role to null in the saved connection', () => {
      return expect(db.connections[0]).to.have.property('role', null)
    })

    it('should return the connection with null for role', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnection')
        .to.deep.equal({
          id: 'connection1',
          firstName: 'CONNECTION_FIRSTNAME',
          lastName: 'CONNECTION_LASTNAME',
          role: null,
          company: {
            id: 'company1',
            name: 'CONNECTION_COMPANY'
          },
          source: {
            id: 'source1',
            name: 'CONNECTION_SOURCE'
          },
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
          }
        })
    })
  })

  describe('when company is not given', () => {
    beforeEach(async () => {
      operation = `
        query {
          person (id: "person1") {
            getOrCreateConnection(
              to: {
                firstName: "CONNECTION_FIRSTNAME",
                lastName: "CONNECTION_LASTNAME",
                title: "CONNECTION_TITLE",
                email: "CONNECTION_EMAIL"
              },
              source: {
                name: "CONNECTION_SOURCE"
              }
            ) {
              id
              firstName
              lastName
              role {
                id
                name
              }
              company {
                id
                name
              }
              source {
                id
                name
              }
              person {
                id
                email
              }
            }
          }
        }
      `
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        sources: [],
        roles: [],
        companies: [
          {
            id: 'company1',
            name: 'Company name'
          }
        ],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a company', () => {
      return expect(db.companies).to.have.length(1)
    })

    it('should set the company to null in the saved connection', () => {
      return expect(db.connections[0]).to.have.property('company', null)
    })

    it('should return the connection with null for company', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnection')
        .to.deep.equal({
          id: 'connection1',
          firstName: 'CONNECTION_FIRSTNAME',
          lastName: 'CONNECTION_LASTNAME',
          role: {
            id: 'role1',
            name: 'CONNECTION_TITLE'
          },
          company: null,
          source: {
            id: 'source1',
            name: 'CONNECTION_SOURCE'
          },
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
          }
        })
    })
  })
})
