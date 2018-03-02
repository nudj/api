/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    people {
      tasks {
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

describe('Person.personTasks', () => {
  it('should fetch all personTasks relating to the person', async () => {
    const db = merge(baseData, {
      personTasks: [
        {
          id: 'personTask1',
          person: 'person1'
        },
        {
          id: 'personTask2',
          person: 'person1'
        },
        {
          id: 'personTask3',
          person: 'person2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            tasks: [
              {
                id: 'personTask1'
              },
              {
                id: 'personTask2'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      personTasks: [
        {
          id: 'personTask1',
          person: 'person2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            tasks: []
          }
        ]
      }
    })
  })
})
