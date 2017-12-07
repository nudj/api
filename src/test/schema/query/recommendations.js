/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.recommendations', () => {
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
    const query = `
      query {
        recommendations {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
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
    const query = `
      query {
        recommendations {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        recommendations: []
      }
    })
  })
})
