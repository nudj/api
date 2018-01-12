/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.role', () => {
  it('should fetch a single role', async () => {
    const db = {
      roles: [
        {
          id: 'role1'
        },
        {
          id: 'role2'
        }
      ]
    }
    const operation = `
      mutation ($id: ID!) {
        role(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'role2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        role: {
          id: 'role2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      roles: []
    }
    const operation = `
      mutation ($id: ID!) {
        role(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'role2'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        role: null
      }
    })
  })
})
