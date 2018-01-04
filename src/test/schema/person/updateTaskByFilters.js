/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.updateTaskByFilters', () => {
  const operation = `
    query {
      person (id: "person1") {
        updateTaskByFilters(
          filters: {
            type: "TASK_TYPE_1"
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
          type: 'TASK_TYPE_1',
          person: 'person1',
          completed: false
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          updateTaskByFilters: {
            id: 'personTask1',
            type: 'TASK_TYPE_1',
            completed: true
          }
        }
      }
    })
  })
})
