/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Referral.parent', () => {
  it('should fetch parent referral', async () => {
    const db = {
      referrals: [
        {
          id: 'referral1'
        },
        {
          id: 'referral2',
          parent: 'referral1'
        }
      ]
    }
    const operation = `
      query {
        referral (id: "referral2") {
          parent {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        referral: {
          parent: {
            id: 'referral1'
          }
        }
      }
    })
  })

  it('should return null and error if no matches', async () => {
    const db = {
      referrals: [
        {
          id: 'referral1'
        }
      ]
    }
    const operation = `
      query {
        referral (id: "referral1") {
          parent {
            id
          }
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: [
          'referral',
          'parent'
        ]
      }))
  })
})
