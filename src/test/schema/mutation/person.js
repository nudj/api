/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.person', () => {
  it('should fetch a single person', async () => {
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
    const operation = `
      mutation ($id: ID!) {
        person(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'person2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          id: 'person2'
        }
      }
    })
  })

  it('should return null if no match', async () => {
    const db = {
      people: []
    }
    const operation = `
      mutation ($id: ID!) {
        person(id: $id) {
          id
        }
      }
    `
    const variables = {
      id: 'person2'
    }

    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        person: null
      }
    })
  })
})
