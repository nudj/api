/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.company', () => {
  it('should fetch a single company', async () => {
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
    const mutation = `
      mutation ($id: ID!) {
        company(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'company2'
    }
    return expect(executeQueryOnDbUsingSchema({ mutation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        company: {
          id: 'company2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      companies: []
    }
    const mutation = `
      mutation ($id: ID!) {
        company(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'company2'
    }

    return executeQueryOnDbUsingSchema({ mutation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['company']
      }))
  })
})
