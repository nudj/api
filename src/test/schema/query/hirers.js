/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.hirers', () => {
  it('should fetch all hirers', async () => {
    const db = {
      hirers: [
        {
          id: 'hirer1'
        },
        {
          id: 'hirer2'
        }
      ]
    }
    const operation = `
      query {
        hirers {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        hirers: [
          {
            id: 'hirer1'
          },
          {
            id: 'hirer2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      hirers: []
    }
    const operation = `
      query {
        hirers {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        hirers: []
      }
    })
  })
})
