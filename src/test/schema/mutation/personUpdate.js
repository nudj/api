/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.personUpdate', () => {
  it("should update the person's data", () => {
    const db = {
      people: [
        {
          id: 'person1',
          email: '',
          firstName: '',
          lastName: '',
          url: '',
          emailPreference: ''
        }
      ]
    }

    const operation = `
      mutation SetEmailPreference ($emailPreference: EmailPreference) {
        updatePerson(
          id: "person1",
          data: {
            email: "test@test.tld",
            firstName: "Tester",
            lastName: "McTestFace",
            url: "lol.tld",
            emailPreference: $emailPreference
          }
        ) {
          id
          email
          firstName
          lastName
          url
          emailPreference
        }
      }
    `

    const variables = { emailPreference: 'GOOGLE' }

    return executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    }).then(() => {
      return expect(db.people[0]).to.deep.equal({
        id: 'person1',
        email: 'test@test.tld',
        firstName: 'Tester',
        lastName: 'McTestFace',
        url: 'lol.tld',
        emailPreference: 'GOOGLE'
      })
    })
  })
})
