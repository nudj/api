/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Connection.from', () => {
  it('should fetch filtered "from"', async () => {
    const db = {
      connections: [
        {
          id: 'connection1',
          from: 'person2'
        }
      ],
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ]
    }
    const operation = `
      query {
        connection (id: "connection1") {
          from {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connection: {
          from: {
            id: 'person2'
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
          from: 'person3'
        }
      ],
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ]
    }
    const operation = `
      query {
        connection (id: "connection1") {
          from {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        connection: {
          from: null
        }
      }
    })
  })
})
