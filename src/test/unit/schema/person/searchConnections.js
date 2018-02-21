/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    people {
      searchConnections(
        query: "bo",
        fields: [ "firstName", "lastName" ]
      ) {
        id
        firstName
        lastName
      }
    }
  }
`
const baseData = {
  people: [
    {
      id: 'person1'
    }
  ]
}

describe('Person.searchConnections', () => {
  it('should fetch all connections relating to the person', async () => {
    const db = merge(baseData, {
      connections: [
        {
          id: 'connection1',
          from: 'person1',
          firstName: 'Bob',
          lastName: 'Johnson'
        },
        {
          id: 'connection2',
          from: 'person1',
          firstName: 'Boy',
          lastName: 'Johnson'
        },
        {
          id: 'connection3',
          from: 'person1',
          firstName: 'Bill',
          lastName: 'Johnson'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            searchConnections: [
              {
                id: 'connection1',
                firstName: 'Bob',
                lastName: 'Johnson'
              },
              {
                id: 'connection2',
                firstName: 'Boy',
                lastName: 'Johnson'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      connections: [
        {
          id: 'connection1',
          from: 'person1',
          firstName: 'Tom',
          lastName: 'Johnson'
        },
        {
          id: 'connection2',
          from: 'person1',
          firstName: 'Alan',
          lastName: 'Johnson'
        },
        {
          id: 'connection3',
          from: 'person1',
          firstName: 'Bill',
          lastName: 'Johnson'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            searchConnections: []
          }
        ]
      }
    })
  })
})
