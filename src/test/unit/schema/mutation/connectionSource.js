/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.source', () => {
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
      mutation ($id: ID!) {
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
      mutation ($id: ID!) {
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
