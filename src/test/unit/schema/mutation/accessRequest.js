/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const operation = `
  mutation (
    $accessRequestId: ID!
  ) {
    accessRequest (
      id: $accessRequestId
    ) {
      id
    }
  }
`
const db = {
  accessRequests: [
    {
      id: 'accessRequest1'
    }
  ]
}

describe('Query.accessRequest', () => {
  it('should fetch the accessRequest', async () => {
    const variables = {
      accessRequestId: 'accessRequest1'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        accessRequest: {
          id: 'accessRequest1'
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const variables = {
      accessRequestId: 'accessRequest2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        accessRequest: null
      }
    })
  })
})
