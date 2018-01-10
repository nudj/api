/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('PersonTask.person', () => {
  it('should fetch filtered person', async () => {
    const db = {
      personTasks: [
        {
          id: 'personTask1',
          completedBy: 'person2'
        }
      ],
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ]
    }
    const operation = `
      query {
        personTask (id: "personTask1") {
          completedBy {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        personTask: {
          completedBy: {
            id: 'person2'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      personTasks: [
        {
          id: 'personTask1',
          completedBy: 'person3'
        }
      ],
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ]
    }
    const operation = `
      query {
        personTask (id: "personTask1") {
          completedBy {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        personTask: {
          completedBy: null
        }
      }
    })
  })
})
