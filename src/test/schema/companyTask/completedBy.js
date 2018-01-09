/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('CompanyTask.completedBy', () => {
  it('should fetch filtered person', async () => {
    const db = {
      companyTasks: [
        {
          id: 'companyTask1',
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
        companyTask (id: "companyTask1") {
          completedBy {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companyTask: {
          completedBy: {
            id: 'person2'
          }
        }
      }
    })
  })

  it('should return null and error if no matches', async () => {
    const db = {
      companyTasks: [
        {
          id: 'companyTask1',
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
        companyTask (id: "companyTask1") {
          completedBy {
            id
          }
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: [
          'companyTask',
          'completedBy'
        ]
      }))
  })
})
