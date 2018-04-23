/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.role', () => {
  it('should fetch the current role', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ],
      roles: [
        {
          id: 'role1',
          name: 'Superhero'
        },
        {
          id: 'role2',
          name: 'Chess Grandmaster'
        },
        {
          id: 'role3',
          name: 'Town Crier'
        }
      ],
      personRoles: [
        {
          id: 'personRole1',
          person: 'person1',
          role: 'role1',
          current: false
        },
        {
          id: 'personRole2',
          person: 'person2',
          role: 'role2',
          current: false
        },
        {
          id: 'personRole3',
          person: 'person1',
          role: 'role3',
          current: true
        }
      ]
    }
    const operation = `
      query {
        person (id: "person1") {
          role {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          role: {
            id: 'role3'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      roles: [
        {
          id: 'role1',
          name: 'Superhero'
        },
        {
          id: 'role2',
          name: 'Chess Grandmaster'
        },
        {
          id: 'role3',
          name: 'Town Crier'
        }
      ],
      personRoles: [
        {
          id: 'personRole2',
          person: 'person2',
          role: 'role2',
          current: false
        }
      ]
    }
    const operation = `
      query {
        person (id: "person1") {
          role {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          role: null
        }
      }
    })
  })
})
