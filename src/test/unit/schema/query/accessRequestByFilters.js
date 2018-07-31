/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  query {
    accessRequestByFilters(filters: { person: "person1" }) {
      id
    }
  }
`

describe('Query.accessRequestByFilters', () => {
  it('should fetch filtered accessRequest', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      accessRequests: [
        {
          id: 'accessRequest1',
          company: 'company1',
          person: 'person1'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        accessRequestByFilters: {
          id: 'accessRequest1'
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      accessRequests: [
        {
          id: 'accessRequest1',
          company: 'company1',
          person: 'person999'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        accessRequestByFilters: null
      }
    })
  })
})
