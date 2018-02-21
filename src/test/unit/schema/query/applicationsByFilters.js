/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.applicationsByFilters', () => {
  it('should fetch filtered applications', async () => {
    const db = {
      applications: [
        {
          id: 'application1'
        },
        {
          id: 'application2'
        }
      ]
    }
    const operation = `
      query {
        applicationsByFilters(filters: {
          id: "application2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        applicationsByFilters: [
          {
            id: 'application2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      applications: []
    }
    const operation = `
      query {
        applicationsByFilters(filters: {
          id: "application2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        applicationsByFilters: []
      }
    })
  })
})
