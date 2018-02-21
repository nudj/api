/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.rolesByFilters', () => {
  it('should fetch filtered roles', async () => {
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
      mutation {
        rolesByFilters(filters: {
          id: "role2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        rolesByFilters: [
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
      mutation {
        rolesByFilters(filters: {
          id: "role2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        rolesByFilters: []
      }
    })
  })
})
