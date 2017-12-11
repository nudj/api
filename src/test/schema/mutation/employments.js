/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.employments', () => {
  it('should fetch all employments', async () => {
    const db = {
      employments: [
        {
          id: 'employment1'
        },
        {
          id: 'employment2'
        }
      ]
    }
    const operation = `
      mutation {
        employments {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        employments: [
          {
            id: 'employment1'
          },
          {
            id: 'employment2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      employments: []
    }
    const operation = `
      mutation {
        employments {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        employments: []
      }
    })
  })
})
