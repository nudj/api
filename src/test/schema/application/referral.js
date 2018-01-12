/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Application.referral', () => {
  it('should fetch filtered referral', async () => {
    const db = {
      applications: [
        {
          id: 'application1',
          referral: 'referral2'
        }
      ],
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
      query {
        application (id: "application1") {
          referral {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        application: {
          referral: {
            id: 'referral2'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      applications: [
        {
          id: 'application1',
          referral: 'referral3'
        }
      ],
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
      query {
        application (id: "application1") {
          referral {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        application: {
          referral: null
        }
      }
    })
  })
})
