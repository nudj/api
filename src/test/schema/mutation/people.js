/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.people', () => {
  it('should fetch all people', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ]
    }
    const mutation = `
      mutation {
        people {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        people: [
          {
            id: 'person1'
          },
          {
            id: 'person2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      people: []
    }
    const mutation = `
      mutation {
        people {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        people: []
      }
    })
  })
})
