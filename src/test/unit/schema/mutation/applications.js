/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.applications', () => {
  it('should fetch all applications', async () => {
    const db = {
      applications: [
        {
          id: 'application1'
        },
        {
          id: 'application2'
        }
      ]
    }
    const operation = `
      mutation {
        applications {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        applications: [
          {
            id: 'application1'
          },
          {
            id: 'application2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      applications: []
    }
    const operation = `
      mutation {
        applications {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        applications: []
      }
    })
  })
})
