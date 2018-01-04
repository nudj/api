/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe.only('Person.getOrCreateConnection', () => {
  let db
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
            name
          }
          company {
            name
          }
          source {
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

  beforeEach(() => {
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
  })

  it('should create the connection and return the result', async () => {
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.have.deep.property('data.person.getOrCreateConnection', {
      firstName: 'CONNECTION_FIRSTNAME',
      lastName: 'CONNECTION_LASTNAME',
      role: {
        name: 'CONNECTION_TITLE'
      },
      company: {
        name: 'CONNECTION_COMPANY'
      },
      source: {
        name: 'CONNECTION_SOURCE'
      },
      person: {
        email: 'CONNECTION_EMAIL'
      }
    })
  })
})
