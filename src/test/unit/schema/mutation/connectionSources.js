/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.sources', () => {
  it('should fetch all sources', async () => {
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
        sources {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        sources: [
          {
            id: 'source1'
          },
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
        sources {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        sources: []
      }
    })
  })
})
