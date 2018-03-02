/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    people {
      connections {
        id
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

describe('Person.connections', () => {
  it('should fetch all connections relating to the person', async () => {
    const db = merge(baseData, {
      connections: [
        {
          id: 'connection1',
          from: 'person1'
        },
        {
          id: 'connection2',
          from: 'person1'
        },
        {
          id: 'connection3',
          from: 'person2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            connections: [
              {
                id: 'connection1'
              },
              {
                id: 'connection2'
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
          from: 'person2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            connections: []
          }
        ]
      }
    })
  })
})
