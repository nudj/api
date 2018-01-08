/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.sourcesByFilters', () => {
  it('should fetch filtered sources', async () => {
    const db = {
      sources: [
        {
          id: 'source1'
        },
        {
          id: 'source2'
        }
      ]
    }
    const operation = `
      mutation {
        sourcesByFilters(filters: {
          id: "source2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        sourcesByFilters: [
          {
            id: 'source2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      sources: []
    }
    const operation = `
      mutation {
        sourcesByFilters(filters: {
          id: "source2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        sourcesByFilters: []
      }
    })
  })
})
