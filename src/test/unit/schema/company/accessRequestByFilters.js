/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  query {
    company (id: "company1") {
      accessRequestByFilters(filters: { person: "person2" }) {
        id
        person {
          id
        }
      }
    }
  }
`

describe('Company.accessRequestByFilters', () => {
  it('should fetch filtered accessRequest', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
        }
      ],
      accessRequests: [
        {
          id: 'accessRequest1',
          company: 'company1',
          person: 'person1'
        },
        {
          id: 'accessRequest2',
          company: 'company1',
          person: 'person1'
        },
        {
          id: 'accessRequest3',
          company: 'company1',
          person: 'person2'
        }
      ]
    }
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        company: {
          accessRequestByFilters: {
            id: 'accessRequest3',
            person: {
              id: 'person2'
            }
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      companies: [
        {
          id: 'company1'
        }
      ],
      people: [
        {
          id: 'person1'
        },
        {
          id: 'person2'
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
        company: {
          accessRequestByFilters: null
        }
      }
    })
  })
})
