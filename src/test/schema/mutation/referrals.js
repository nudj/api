/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.referrals', () => {
  it('should fetch all referrals', async () => {
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
    const query = `
      mutation {
        referrals {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        referrals: [
          {
            id: 'referral1'
          },
          {
            id: 'referral2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      referrals: []
    }
    const query = `
      mutation {
        referrals {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        referrals: []
      }
    })
  })
})
