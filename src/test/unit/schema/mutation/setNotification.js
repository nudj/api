/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation {
    setNotification(
      type: "error",
      message: "Some message"
    ) {
      type
      message
    }
  }
`

describe('Mutation.setNotification', () => {
  it('return the notification', async () => {
    const result = await executeQueryOnDbUsingSchema({
      operation,
      schema
    })
    expect(result)
      .to.have.deep.property('data.setNotification')
      .to.deep.equal({
        type: 'error',
        message: 'Some message'
      })
  })
})
