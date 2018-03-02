/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Referral.person', () => {
  it('should fetch filtered person', async () => {
    const db = {
      referrals: [
        {
          id: 'referral1',
          person: 'person2'
        }
      ],
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ]
    }
    const operation = `
      query {
        referral (id: "referral1") {
          person {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        referral: {
          person: {
            id: 'person2'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      referrals: [
        {
          id: 'referral1',
          person: 'person3'
        }
      ],
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ]
    }
    const operation = `
      query {
        referral (id: "referral1") {
          person {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        referral: {
          person: null
        }
      }
    })
  })
})
