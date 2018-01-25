/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Conversation.recipient', () => {
  it('should fetch filtered recipient', async () => {
    const db = {
      conversations: [
        {
          id: 'conversation1',
          recipient: 'recipient2'
        }
      ],
      people: [
        {
          id: 'recipient1'
        },
        {
          id: 'recipient2'
        }
      ]
    }
    const operation = `
      query {
        conversation (id: "conversation1") {
          recipient {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        conversation: {
          recipient: {
            id: 'recipient2'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      conversations: [
        {
          id: 'conversation1',
          recipient: 'recipient3'
        }
      ],
      people: [
        {
          id: 'recipient1'
        },
        {
          id: 'recipient2'
        }
      ]
    }
    const operation = `
      query {
        conversation (id: "conversation1") {
          recipient {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        conversation: {
          recipient: null
        }
      }
    })
  })
})
