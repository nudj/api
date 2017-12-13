/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.companiesByFilters', () => {
  it('should fetch filtered companies', async () => {
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
    const operation = `
      query {
        companiesByFilters(filters: {
          id: "company2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companiesByFilters: [
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
    const operation = `
      query {
        companiesByFilters(filters: {
          id: "company2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companiesByFilters: []
      }
    })
  })
})
