/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.source', () => {
  it('should fetch a single source', async () => {
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
      query ($id: ID!) {
        source(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'source2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        source: {
          id: 'source2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      sources: []
    }
    const operation = `
      query ($id: ID!) {
        source(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'source2'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        source: null
      }
    })
  })
})
