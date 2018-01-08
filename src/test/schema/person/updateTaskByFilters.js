/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.updateTaskByFilters', () => {
  const operation = `
    query testQuery (
      $taskType: TaskType!
    ) {
      person (id: "person1") {
        updateTaskByFilters(
          filters: {
            type: $taskType
          },
          data: {
            completed: true
          }
        ) {
          id
          type
          completed
        }
      }
    }
  `

  it('should update the task and return the result', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      personTasks: [
        {
          id: 'personTask1',
          type: 'UNLOCK_NETWORK_LINKEDIN',
          person: 'person1',
          completed: false
        }
      ]
    }
    const variables = {
      taskType: 'UNLOCK_NETWORK_LINKEDIN'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          updateTaskByFilters: {
            id: 'personTask1',
            type: 'UNLOCK_NETWORK_LINKEDIN',
            completed: true
          }
        }
      }
    })
  })
})
