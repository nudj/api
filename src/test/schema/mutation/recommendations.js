/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.recommendations', () => {
  it('should fetch all recommendations', async () => {
    const db = {
      recommendations: [
        {
          id: 'recommendation1'
        },
        {
          id: 'recommendation2'
        }
      ]
    }
    const operation = `
      mutation {
        recommendations {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        recommendations: [
          {
            id: 'recommendation1'
          },
          {
            id: 'recommendation2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      recommendations: []
    }
    const operation = `
      mutation {
        recommendations {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        recommendations: []
      }
    })
  })
})
