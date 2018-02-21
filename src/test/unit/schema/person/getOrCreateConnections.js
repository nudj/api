/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.getOrCreateConnections', () => {
  let db
  let result
  const operation = `
    query {
      person (id: "person1") {
        getOrCreateConnections(
          connections: [{
            firstName: "CONNECTION_FIRSTNAME1",
            lastName: "CONNECTION_LASTNAME1",
            title: "CONNECTION_TITLE1",
            company: "CONNECTION_COMPANY1",
            email: "CONNECTION_EMAIL1"
          }, {
            firstName: "CONNECTION_FIRSTNAME2",
            lastName: "CONNECTION_LASTNAME2",
            title: "CONNECTION_TITLE2",
            company: "CONNECTION_COMPANY2",
            email: "CONNECTION_EMAIL2"
          }],
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
        sources: [],
        roles: [],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should create the source', () => {
      expect(db).to.have.deep.property('sources.0').to.deep.equal({
        id: 'source1',
        name: 'CONNECTION_SOURCE'
      })
    })

    it('should only create one source', () => {
      expect(db.sources.length).to.equal(1)
    })

    it('should create the roles', () => {
      expect(db).to.have.deep.property('roles.0').to.deep.equal({
        id: 'role1',
        name: 'CONNECTION_TITLE1'
      })
      expect(db).to.have.deep.property('roles.1').to.deep.equal({
        id: 'role2',
        name: 'CONNECTION_TITLE2'
      })
    })

    it('should create the companies', () => {
      expect(db).to.have.deep.property('companies.0').to.deep.equal({
        id: 'company1',
        client: false,
        name: 'CONNECTION_COMPANY1'
      })
      expect(db).to.have.deep.property('companies.1').to.deep.equal({
        id: 'company2',
        client: false,
        name: 'CONNECTION_COMPANY2'
      })
    })

    it('should create the people', () => {
      expect(db).to.have.deep.property('people.1').to.deep.equal({
        id: 'person2',
        email: 'CONNECTION_EMAIL1'
      })
      expect(db).to.have.deep.property('people.2').to.deep.equal({
        id: 'person3',
        email: 'CONNECTION_EMAIL2'
      })
    })

    it('should return the connections', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnections')
        .to.deep.equal([{
          id: 'connection1',
          firstName: 'CONNECTION_FIRSTNAME1',
          lastName: 'CONNECTION_LASTNAME1',
          role: {
            id: 'role1',
            name: 'CONNECTION_TITLE1'
          },
          company: {
            id: 'company1',
            name: 'CONNECTION_COMPANY1'
          },
          source: {
            id: 'source1',
            name: 'CONNECTION_SOURCE'
          },
          person: {
            id: 'person2',
            email: 'CONNECTION_EMAIL1'
          }
        }, {
          id: 'connection2',
          firstName: 'CONNECTION_FIRSTNAME2',
          lastName: 'CONNECTION_LASTNAME2',
          role: {
            id: 'role2',
            name: 'CONNECTION_TITLE2'
          },
          company: {
            id: 'company2',
            name: 'CONNECTION_COMPANY2'
          },
          source: {
            id: 'source1',
            name: 'CONNECTION_SOURCE'
          },
          person: {
            id: 'person3',
            email: 'CONNECTION_EMAIL2'
          }
        }])
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
      expect(result)
        .to.have.deep.property('data.person.getOrCreateConnections.0.source')
        .to.deep.equal({
          id: 'oldId',
          name: 'CONNECTION_SOURCE'
        })
      expect(result)
        .to.have.deep.property('data.person.getOrCreateConnections.1.source')
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
          name: 'CONNECTION_TITLE1'
        }],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a new role', () => {
      expect(db.roles.length).to.equal(2)
    })

    it('should return the existing role', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnections.0.role')
        .to.deep.equal({
          id: 'oldId',
          name: 'CONNECTION_TITLE1'
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
          name: 'CONNECTION_COMPANY1'
        }],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create a new company', () => {
      expect(db.companies.length).to.equal(2)
    })

    it('should return the existing company', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnections.0.company')
        .to.deep.equal({
          id: 'oldId',
          name: 'CONNECTION_COMPANY1'
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
            id: 'oldId1',
            email: 'CONNECTION_EMAIL1'
          },
          {
            id: 'oldId2',
            email: 'CONNECTION_EMAIL2'
          }
        ],
        sources: [],
        roles: [],
        companies: [],
        connections: []
      }
      result = await executeQueryOnDbUsingSchema({ operation, db, schema })
    })

    it('should not create any new people', () => {
      expect(db.people.length).to.equal(3)
    })

    it('should return the existing people', () => {
      expect(result)
        .to.have.deep.property('data.person.getOrCreateConnections.0.person')
        .to.deep.equal({
          id: 'oldId1',
          email: 'CONNECTION_EMAIL1'
        })
      expect(result)
        .to.have.deep.property('data.person.getOrCreateConnections.1.person')
        .to.deep.equal({
          id: 'oldId2',
          email: 'CONNECTION_EMAIL2'
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
            email: 'CONNECTION_EMAIL1'
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
      expect(db.connections.length).to.equal(2)
    })

    it('should return the existing connection', () => {
      return expect(result)
        .to.have.deep.property('data.person.getOrCreateConnections.0')
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
            email: 'CONNECTION_EMAIL1'
          }
        })
    })
  })
})
