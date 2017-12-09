/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.hirer', () => {
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
    const mutation = `
      mutation ($id: ID!) {
        hirer(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'hirer2'
    }
    return expect(executeQueryOnDbUsingSchema({ mutation, variables, db, schema })).to.eventually.deep.equal({
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
    const mutation = `
      mutation ($id: ID!) {
        hirer(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'hirer2'
    }

    return executeQueryOnDbUsingSchema({ mutation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['hirer']
      }))
  })
})
