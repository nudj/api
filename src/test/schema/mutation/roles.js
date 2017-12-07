/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.roles', () => {
  it('should fetch all roles', async () => {
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
    const query = `
      mutation {
        roles {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        roles: [
          {
            id: 'role1'
          },
          {
            id: 'role2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      roles: []
    }
    const query = `
      mutation {
        roles {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ query, db, schema })).to.eventually.deep.equal({
      data: {
        roles: []
      }
    })
  })
})