/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.companies', () => {
  it('should fetch all companies', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        },
        {
          id: 'company2'
        }
      ]
    }
    const query = `
      query {
        companies {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
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
      companies: []
    }
    const query = `
      query {
        companies {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        companies: []
      }
    })
  })
})