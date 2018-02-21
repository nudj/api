/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Query.conversation', () => {
  it('should fetch a single conversation', async () => {
    const db = {
      conversations: [
        {
          id: 'conversation1'
        },
        {
          id: 'conversation2'
        }
      ]
    }
    const operation = `
      query ($id: ID!) {
        conversation(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'conversation2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        conversation: {
          id: 'conversation2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      conversations: []
    }
    const operation = `
      query ($id: ID!) {
        conversation(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'conversation2'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        conversation: null
      }
    })
  })
})
