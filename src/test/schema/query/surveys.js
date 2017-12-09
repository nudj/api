/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.surveys', () => {
  it('should fetch all surveys', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1'
        },
        {
          id: 'survey2'
        }
      ]
    }
    const query = `
      query {
        surveys {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        surveys: [
          {
            id: 'survey1'
          },
          {
            id: 'survey2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      surveys: []
    }
    const query = `
      query {
        surveys {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        surveys: []
      }
    })
  })
})
