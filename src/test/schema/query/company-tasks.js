/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.companyTasks', () => {
  it('should fetch all companyTasks', async () => {
    const db = {
      companyTasks: [
        {
          id: 'companyTask1'
        },
        {
          id: 'companyTask2'
        }
      ]
    }
    const query = `
      query {
        companyTasks {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        companyTasks: [
          {
            id: 'companyTask1'
          },
          {
            id: 'companyTask2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      companyTasks: []
    }
    const query = `
      query {
        companyTasks {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        companyTasks: []
      }
    })
  })
})
