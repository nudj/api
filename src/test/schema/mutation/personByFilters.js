/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.personByFilters', () => {
  it('should fetch first filtered person', async () => {
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
        personByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'person2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        personByFilters: {
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
        personByFilters (filters: {
          id: $id
        }) {
          id
        }
      }
    `
    const variables = {
      id: 'person2'
    }
    return expect(executeQueryOnDbUsingSchema({ operation, variables, db, schema })).to.eventually.deep.equal({
      data: {
        personByFilters: null
      }
    })
  })
})
