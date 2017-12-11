/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Mutation.referral', () => {
  it('should fetch a single referral', async () => {
    const db = {
      referrals: [
        {
          id: 'referral1'
        },
        {
          id: 'referral2'
        }
      ]
    }
    const operation = `
      mutation ($id: ID!) {
        referral(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'referral2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        referral: {
          id: 'referral2'
        }
      }
    })
  })

  it('should return null and error if no match', async () => {
    const db = {
      referrals: []
    }
    const operation = `
      mutation ($id: ID!) {
        referral(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'referral2'
    }

    return executeQueryOnDbUsingSchema({ operation, variables, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: ['referral']
      }))
  })
})
