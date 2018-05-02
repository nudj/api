/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.referralBySlug', () => {
  it('should fetch a single referral', async () => {
    const db = {
      referrals: [
        {
          slug: 'referral1'
        },
        {
          slug: 'referral2'
        }
      ]
    }
    const operation = `
      query ($slug: String!) {
        referralBySlug(slug: $slug) {
          slug
        }
      }
    `
    const variables = {
      slug: 'referral2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        referralBySlug: {
          slug: 'referral2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      referrals: []
    }
    const operation = `
      query ($slug: String!) {
        referralBySlug(slug: $slug) {
          slug
        }
      }
    `
    const variables = {
      slug: 'referral2'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        referralBySlug: null
      }
    })
  })
})
