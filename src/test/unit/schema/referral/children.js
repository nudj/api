/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Referral.children', () => {
  it('should fetch all the child referrals', () => {
    const db = {
      referrals: [{
        id: 'referral1'
      }, {
        id: 'referral2',
        parent: 'referral1'
      }]
    }

    const operation = `
      query {
        referral(id: "referral1") {
          id
          children {
            id
          }
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        referral: {
          id: 'referral1',
          children: [
            {
              id: 'referral2'
            }
          ]
        }
      }
    })
  })

  it('should return an empty array if referral has no children', () => {
    const db = {
      referrals: [{
        id: 'referral1'
      }]
    }

    const operation = `
      query {
        referral(id: "referral1") {
          id
          children {
            id
          }
        }
      }
    `

    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        referral: {
          id: 'referral1',
          children: []
        }
      }
    })
  })
})
