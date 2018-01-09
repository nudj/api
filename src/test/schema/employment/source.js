/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Employment.source', () => {
  it('should fetch filtered source', async () => {
    const db = {
      employments: [
        {
          id: 'employment1',
          source: 'source2'
        }
      ],
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
      query {
        employment (id: "employment1") {
          source {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        employment: {
          source: {
            id: 'source2'
          }
        }
      }
    })
  })

  it('should return null and error if no matches', async () => {
    const db = {
      employments: [
        {
          id: 'employment1',
          source: 'source3'
        }
      ],
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
      query {
        employment (id: "employment1") {
          source {
            id
          }
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: [
          'employment',
          'source'
        ]
      }))
  })
})
