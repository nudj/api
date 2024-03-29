/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Connection.role', () => {
  it('should fetch filtered role', async () => {
    const db = {
      connections: [
        {
          id: 'connection1',
          role: 'role2'
        }
      ],
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
        connection (id: "connection1") {
          role {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connection: {
          role: {
            id: 'role2'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      connections: [
        {
          id: 'connection1',
          role: 'role3'
        }
      ],
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
        connection (id: "connection1") {
          role {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connection: {
          role: null
        }
      }
    })
  })

  it('should return null if not defined on connection', async () => {
    const db = {
      connections: [
        {
          id: 'connection1'
        }
      ],
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
        connection (id: "connection1") {
          role {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connection: {
          role: null
        }
      }
    })
  })
})
