/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    companies {
      hirers {
        id
      }
    }
  }
`
const baseData = {
  companies: [
    {
      id: 'company1'
    }
  ]
}

describe('Company.hirers', () => {
  it('should fetch all hirers relating to the company', async () => {
    const db = merge(baseData, {
      hirers: [
        {
          id: 'hirer1',
          company: 'company1'
        },
        {
          id: 'hirer2',
          company: 'company1'
        },
        {
          id: 'hirer3',
          company: 'company2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            hirers: [
              {
                id: 'hirer1'
              },
              {
                id: 'hirer2'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      hirers: [
        {
          id: 'hirer1',
          company: 'company2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            hirers: []
          }
        ]
      }
    })
  })
})
