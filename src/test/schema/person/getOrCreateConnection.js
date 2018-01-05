/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.getOrCreateConnection', () => {
  let db
  let result
  const operation = `
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
          source: "CONNECTION_SOURCE"
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
        connectionSources: [],
        roles: [],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should create the connectionSource', () => {
      return expect(db).to.have.deep.property('connectionSources.0').to.deep.equal({
        id: 'newId',
        name: 'CONNECTION_SOURCE'
      })
    })

    it('should create the role', () => {
      return expect(db).to.have.deep.property('roles.0').to.deep.equal({
        id: 'newId',
        name: 'CONNECTION_TITLE'
      })
    })

    it('should create the company', () => {
      return expect(db).to.have.deep.property('companies.0').to.deep.equal({
        id: 'newId',
        name: 'CONNECTION_COMPANY'
      })
    })

    it('should create the person', () => {
      return expect(db).to.have.deep.property('people.1').to.deep.equal({
        id: 'newId',
        email: 'CONNECTION_EMAIL'
      })
    })

    it('should return the connection', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnection')
        .to.deep.equal({
          id: 'newId',
          firstName: 'CONNECTION_FIRSTNAME',
          lastName: 'CONNECTION_LASTNAME',
          role: {
            id: 'newId',
            name: 'CONNECTION_TITLE'
          },
          company: {
            id: 'newId',
            name: 'CONNECTION_COMPANY'
          },
          source: {
            id: 'newId',
            name: 'CONNECTION_SOURCE'
          },
          person: {
            id: 'newId',
            email: 'CONNECTION_EMAIL'
          }
        })
    })
  })

  describe('when connectionSource already exists', () => {
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        connectionSources: [{
          id: 'oldId',
          name: 'CONNECTION_SOURCE'
        }],
        roles: [],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a new connectionSource', () => {
      expect(db.connectionSources.length).to.equal(1)
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
        connectionSources: [],
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
        connectionSources: [],
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
        connectionSources: [],
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
        connectionSources: [{
          id: 'connectionSource1',
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
          source: 'connectionSource1',
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
            id: 'connectionSource1',
            name: 'linkedin'
          },
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
          }
        })
    })
  })
})
