/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Person.company', () => {
  it('should fetch the current company', async () => {
    const db = {
      people: [
        {
          id: 'person1'
        }
      ],
      companies: [
        {
          id: 'company1',
          name: 'Google'
        }
      ],
      employments: [
        {
          id: 'employment1',
          person: 'person1',
          company: 'company1'
        }
      ],
      currentEmployments: [
        {
          id: 'currentEmployment1',
          person: 'person1',
          employment: 'employment1'
        }
      ]
    }
    const operation = `
      query {
        person (id: "person1") {
          company {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          company: {
            id: 'company1'
          }
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
      companies: [
        {
          id: 'company1',
          name: 'Google'
        },
        {
          id: 'company2',
          name: 'Apple'
        },
        {
          id: 'company3',
          name: 'Microsoft'
        }
      ],
      employments: [
        {
          id: 'employment2',
          person: 'person2',
          company: 'company2',
          current: false
        }
      ]
    }
    const operation = `
      query {
        person (id: "person1") {
          company {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        person: {
          company: null
        }
      }
    })
  })
})
