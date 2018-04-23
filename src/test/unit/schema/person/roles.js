/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.roles', () => {
  it('should fetch filtered roles', async () => {
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
          current: true
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
          current: false
        }
      ]
    }
    const operation = `
      query {
        person (id: "person1") {
          roles {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          roles: [
            {
              id: 'role1'
            },
            {
              id: 'role3'
            }
          ]
        }
      }
    })
  })

  it('should return an empty array if no matches', async () => {
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
          current: true
        }
      ]
    }
    const operation = `
      query {
        person (id: "person1") {
          roles {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          roles: []
        }
      }
    })
  })
})
