/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Query.hirer', () => {
  it('should fetch a single hirer', async () => {
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
    const query = `
      query ($id: ID!) {
        hirer(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'hirer2'
    }
    return expect(executeQueryOnDbUsingSchema({ query, variables, db, schema })).to.eventually.deep.equal({
      data: {
        hirer: {
          id: 'hirer2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      hirers: []
    }
    const query = `
      query ($id: ID!) {
        hirer(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'hirer2'
    }

    return executeQueryOnDbUsingSchema({ query, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['hirer']
      }))
  })
})
