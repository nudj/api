/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    people {
      referrals {
        id
      }
    }
  }
`
const baseData = {
  people: [
    {
      id: 'person1'
    }
  ]
}

describe('Person.referrals', () => {
  it('should fetch all referrals relating to the person', async () => {
    const db = merge(baseData, {
      referrals: [
        {
          id: 'referral1',
          person: 'person1'
        },
        {
          id: 'referral2',
          person: 'person1'
        },
        {
          id: 'referral3',
          person: 'person2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            referrals: [
              {
                id: 'referral1'
              },
              {
                id: 'referral2'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      referrals: [
        {
          id: 'referral1',
          person: 'person2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            referrals: []
          }
        ]
      }
    })
  })
})
