/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    people {
      employments {
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

describe('Person.employments', () => {
  it('should fetch all employments relating to the person', async () => {
    const db = merge(baseData, {
      employments: [
        {
          id: 'employment1',
          person: 'person1'
        },
        {
          id: 'employment2',
          person: 'person1'
        },
        {
          id: 'employment3',
          person: 'person2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            employments: [
              {
                id: 'employment1'
              },
              {
                id: 'employment2'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      employments: [
        {
          id: 'employment1',
          person: 'person2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            employments: []
          }
        ]
      }
    })
  })
})
