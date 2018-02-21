/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.hirersByFilters', () => {
  it('should fetch filtered hirers', async () => {
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
        hirersByFilters(filters: {
          id: "hirer2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        hirersByFilters: [
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
        hirersByFilters(filters: {
          id: "hirer2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        hirersByFilters: []
      }
    })
  })
})
