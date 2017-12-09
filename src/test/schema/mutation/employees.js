/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.employees', () => {
  it('should fetch all employees', async () => {
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
        applications {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        applications: [
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
        applications {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ mutation, db, schema })).to.eventually.deep.equal({
      data: {
        applications: []
      }
    })
  })
})
