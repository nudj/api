/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.rolesByFilters', () => {
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
      query {
        rolesByFilters {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        rolesByFilters: [
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
        rolesByFilters {
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
