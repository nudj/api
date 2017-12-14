/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    companies {
      jobs {
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

describe('Company.jobs', () => {
  it('should fetch all jobs relating to the company', async () => {
    const db = merge(baseData, {
      jobs: [
        {
          id: 'job1',
          company: 'company1'
        },
        {
          id: 'job2',
          company: 'company1'
        },
        {
          id: 'job3',
          company: 'company2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            jobs: [
              {
                id: 'job1'
              },
              {
                id: 'job2'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      jobs: [
        {
          id: 'job1',
          company: 'company2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            jobs: []
          }
        ]
      }
    })
  })
})
