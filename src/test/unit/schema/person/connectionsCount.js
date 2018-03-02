/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

chai.use(chaiAsPromised)

describe('Person.connectionsCount', async () => {
  it('returns the person\'s total number of connections', () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      connections: [
        {
          id: 'connection1',
          from: 'person1'
        },
        {
          id: 'connection2',
          from: 'person1'
        },
        {
          id: 'connection2',
          from: 'person2'
        }
      ]
    }

    const operation = `
      query {
        person (id: "person1") {
          connectionsCount
        }
      }
    `

    return expect(
      executeQueryOnDbUsingSchema({
        operation,
        db,
        schema
      })
    ).to.eventually.deep.equal({
      data: {
        person: {
          connectionsCount: 2
        }
      }
    })
  })
})
