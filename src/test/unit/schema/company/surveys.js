/* eslint-env mocha */
const chai = require('chai')
const { merge } = require('@nudj/library')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  query {
    companies {
      surveys {
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
  ],
  surveys: [
    {
      id: 'survey1',
      company: 'company1'
    },
    {
      id: 'survey2',
      company: 'company1'
    },
    {
      id: 'survey3',
      company: 'company2'
    }
  ]
}

describe('Company.surveys', () => {
  it('should fetch all surveys relating to the company', async () => {
    const db = baseData
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            surveys: [
              {
                id: 'survey1'
              },
              {
                id: 'survey2'
              }
            ]
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = merge(baseData, {
      surveys: [
        {
          id: 'survey1',
          company: 'company2'
        },
        {
          id: 'survey1',
          company: 'company2'
        }
      ]
    })
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        companies: [
          {
            surveys: []
          }
        ]
      }
    })
  })
})
