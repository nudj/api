/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.peopleByFilters', () => {
  it('should fetch filtered people', async () => {
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
      mutation {
        peopleByFilters(filters: {
          id: "person2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        peopleByFilters: [
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
    const operation = `
      mutation {
        peopleByFilters(filters: {
          id: "person2"
        }) {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        peopleByFilters: []
      }
    })
  })
})
