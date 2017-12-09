/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.applicationsByFilters', () => {
  it('should fetch filtered applications', async () => {
    const db = {
      applications: [
        {
          id: 'application1'
        },
        {
          id: 'application2'
        }
      ]
    }
    const mutation = `
      mutation {
        applicationsByFilters {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        applicationsByFilters: [
          {
            id: 'application1'
          },
          {
            id: 'application2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      applications: []
    }
    const mutation = `
      mutation {
        applicationsByFilters {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        applicationsByFilters: []
      }
    })
  })
})
