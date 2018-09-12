/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation (
    $hash: String!
  ) {
    createMessageEvent(
      hash: $hash
    ) {
      id
      hash
    }
  }
`

describe('Mutation.createMessageEvent', () => {
  let db
  let result
  let variables = {
    hash: 'abc123'
  }

  beforeEach(async () => {
    db = {
      messageEvents: []
    }
    result = await executeQueryOnDbUsingSchema({
      operation,
      variables,
      db,
      schema
    })
  })

  afterEach(() => {
    result = undefined
  })

  it('should create the messageEvent', async () => {
    expect(db.messageEvents[0]).to.have.property('id', 'messageEvent1')
    expect(db.messageEvents[0]).to.have.property('hash', 'abc123')
  })

  it('return the new messageEvent', async () => {
    expect(result).to.have.deep.property('data.createMessageEvent')
    expect(result.data.createMessageEvent).to.have.property('id', 'messageEvent1')
    expect(result.data.createMessageEvent).to.have.property('hash', 'abc123')
  })
})
