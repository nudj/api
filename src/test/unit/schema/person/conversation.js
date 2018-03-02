/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    people {
      conversations {
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

describe('Person.conversations', () => {
  it('should fetch all conversations relating to the person', async () => {
    const db = merge(baseData, {
      conversations: [
        {
          id: 'conversation1',
          person: 'person1'
        },
        {
          id: 'conversation2',
          person: 'person1'
        },
        {
          id: 'conversation3',
          person: 'person2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            conversations: [
              {
                id: 'conversation1'
              },
              {
                id: 'conversation2'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      conversations: [
        {
          id: 'conversation1',
          person: 'person2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            conversations: []
          }
        ]
      }
    })
  })
})
