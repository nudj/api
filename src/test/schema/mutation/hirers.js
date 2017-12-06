/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.hirers', () => {
  it('should fetch all hirers', async () => {
    const db = {
      hirers: [
        {
          id: 'company1'
        },
        {
          id: 'company2'
        }
      ]
    }
    const query = `
      mutation {
        hirers {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        hirers: [
          {
            id: 'company1'
          },
          {
            id: 'company2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      hirers: []
    }
    const query = `
      mutation {
        hirers {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        hirers: []
      }
    })
  })
})
