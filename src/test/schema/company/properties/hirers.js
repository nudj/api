/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDataUsingSchema } = require('../../../helpers')
const query = `
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
    const data = merge(baseData, {
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
    return expect(executeQueryOnDataUsingSchema({ query, data, schema })).to.eventually.deep.equal({
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
    const data = merge(baseData, {
      hirers: [
        {
          id: 'hirer1',
          company: 'company2'
        }
      ]
    })
    return expect(executeQueryOnDataUsingSchema({ query, data, schema })).to.eventually.deep.equal({
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
