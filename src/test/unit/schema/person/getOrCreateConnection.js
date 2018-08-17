/* eslint-env mocha */
const chai = require('chai')
const nock = require('nock')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const mockClearbitRequests = require('../../helpers/clearbit/mock-requests')
const DataSources = require('../../../../gql/schema/enums/data-sources')

describe('Person.getOrCreateConnection', () => {
  before(() => {
    mockClearbitRequests()
  })

  after(() => {
    nock.cleanAll()
  })

  let db
  let result
  let operation = `
    query getOrCreateConnection (
      $to: ConnectionCreateInput!,
      $source: DataSource!
    ) {
      person (id: "person1") {
        getOrCreateConnection(
          to: $to,
          source: $source
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
            slug
          }
          person {
            id
            email
          }
          source
        }
      }
    }
  `
  let variables = {
    to: {
      firstName: 'CONNECTION_FIRSTNAME',
      lastName: 'CONNECTION_LASTNAME',
      title: 'CONNECTION_TITLE',
      company: 'CONNECTION_COMPANY',
      email: 'CONNECTION_EMAIL'
    },
    source: DataSources.values.LINKEDIN
  }

  describe('when new roles, companies and people are given', () => {
    beforeEach(async () => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        roles: [],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should create the role', () => {
      return expect(db).to.have.deep.property('roles.0').to.deep.equal({
        id: 'role1',
        name: 'CONNECTION_TITLE'
      })
    })

    it('should create the company', () => {
      expect(db.companies[0]).to.have.property('id', 'company1')
      expect(db.companies[0]).to.have.property('client', false)
      expect(db.companies[0]).to.have.property('onboarded', false)
      expect(db.companies[0]).to.have.property('name', 'CONNECTION_COMPANY')
      expect(db.companies[0]).to.have.property('slug', 'connection_company')
      expect(db.companies[0]).to.have.property('hash').to.match(/[a-z0-9]{128}/)
    })

    it('should create the person', () => {
      return expect(db).to.have.deep.property('people.1').to.deep.equal({
        email: 'CONNECTION_EMAIL',
        id: 'person2'
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
            name: 'CONNECTION_COMPANY',
            slug: 'connection_company'
          },
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
          },
          source: DataSources.values.LINKEDIN
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
        roles: [{
          id: 'oldId',
          name: 'CONNECTION_TITLE'
        }],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
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
        roles: [],
        companies: [{
          id: '99764801b2683fb0e09442ff1cfcf23a',
          name: 'CONNECTION_COMPANY',
          slug: 'connection_company'
        }],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
    })

    it('should not create a new company', () => {
      expect(db.companies.length).to.equal(1)
    })

    it('should return the existing company', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnection.company')
        .to.deep.equal({
          id: '99764801b2683fb0e09442ff1cfcf23a',
          name: 'CONNECTION_COMPANY',
          slug: 'connection_company'
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
        roles: [],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
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
        roles: [{
          id: 'role1',
          name: 'Sales Manager'
        }],
        companies: [{
          id: 'company1',
          name: 'nudj',
          slug: 'nudj'
        }],
        connections: [{
          id: 'oldId',
          firstName: 'Bob',
          lastName: 'Johnson',
          from: 'person1',
          person: 'person2',
          source: DataSources.values.LINKEDIN,
          role: 'role1',
          company: 'company1'
        }]
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
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
            name: 'nudj',
            slug: 'nudj'
          },
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
          },
          source: DataSources.values.LINKEDIN
        })
    })
  })

  describe('when title is not given', () => {
    beforeEach(async () => {
      variables = {
        to: {
          firstName: 'CONNECTION_FIRSTNAME',
          lastName: 'CONNECTION_LASTNAME',
          company: 'CONNECTION_COMPANY',
          email: 'CONNECTION_EMAIL'
        },
        source: DataSources.values.LINKEDIN
      }
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        roles: [
          {
            id: 'role1',
            name: 'Test role'
          }
        ],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
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
            name: 'CONNECTION_COMPANY',
            slug: 'connection_company'
          },
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
          },
          source: DataSources.values.LINKEDIN
        })
    })
  })

  describe('when title is an empty string', () => {
    beforeEach(async () => {
      variables = {
        to: {
          firstName: 'CONNECTION_FIRSTNAME',
          lastName: 'CONNECTION_LASTNAME',
          company: 'CONNECTION_COMPANY',
          email: 'CONNECTION_EMAIL',
          title: ''
        },
        source: DataSources.values.LINKEDIN
      }
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        roles: [
          {
            id: 'role1',
            name: 'Test role'
          }
        ],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
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
            name: 'CONNECTION_COMPANY',
            slug: 'connection_company'
          },
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
          },
          source: DataSources.values.LINKEDIN
        })
    })
  })

  describe('when company is not given', () => {
    beforeEach(async () => {
      variables = {
        to: {
          firstName: 'CONNECTION_FIRSTNAME',
          lastName: 'CONNECTION_LASTNAME',
          title: 'CONNECTION_TITLE',
          email: 'CONNECTION_EMAIL'
        },
        source: DataSources.values.LINKEDIN
      }
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        roles: [],
        companies: [
          {
            id: 'company1',
            name: 'Company name',
            slug: 'company name'
          }
        ],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
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
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
          },
          source: DataSources.values.LINKEDIN
        })
    })
  })

  describe('when company is empty string', () => {
    beforeEach(async () => {
      variables = {
        to: {
          firstName: 'CONNECTION_FIRSTNAME',
          lastName: 'CONNECTION_LASTNAME',
          title: 'CONNECTION_TITLE',
          email: 'CONNECTION_EMAIL',
          company: ''
        },
        source: DataSources.values.LINKEDIN
      }
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        roles: [],
        companies: [
          {
            id: 'company1',
            name: 'Company name'
          }
        ],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, variables, db, schema })
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
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL'
          },
          source: DataSources.values.LINKEDIN
        })
    })
  })
})
