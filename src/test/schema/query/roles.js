/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.roles', () => {
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
    const operation = `
      query {
        roles {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
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
    const operation = `
      query {
        roles {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        roles: []
      }
    })
  })
})
