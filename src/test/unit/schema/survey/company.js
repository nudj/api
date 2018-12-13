/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Survey.company', () => {
  it('should fetch filtered company', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1',
          company: 'company1'
        }
      ],
      companies: [
        {
          id: 'company1'
        }
      ]
    }
    const operation = `
      query {
        survey (id: "survey1") {
          company {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        survey: {
          company: {
            id: 'company1'
          }
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1'
        }
      ],
      companies: [
        {
          id: 'company1'
        }
      ],
      companySurveys: []
    }
    const operation = `
      query {
        survey (id: "survey1") {
          company {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        survey: {
          company: null
        }
      }
    })
  })
})
