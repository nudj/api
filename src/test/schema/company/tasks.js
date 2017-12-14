/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    companies {
      tasks {
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

describe('Company.companyTasks', () => {
  it('should fetch all companyTasks relating to the company', async () => {
    const db = merge(baseData, {
      companyTasks: [
        {
          id: 'companyTask1',
          company: 'company1'
        },
        {
          id: 'companyTask2',
          company: 'company1'
        },
        {
          id: 'companyTask3',
          company: 'company2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            tasks: [
              {
                id: 'companyTask1'
              },
              {
                id: 'companyTask2'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      companyTasks: [
        {
          id: 'companyTask1',
          company: 'company2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            tasks: []
          }
        ]
      }
    })
  })
})
