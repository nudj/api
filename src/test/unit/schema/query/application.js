/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.application', () => {
  it('should fetch a single application', async () => {
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
      query ($id: ID!) {
        application(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'application2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        application: {
          id: 'application2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      applications: []
    }
    const operation = `
      query ($id: ID!) {
        application(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'application2'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        application: null
      }
    })
  })
})
