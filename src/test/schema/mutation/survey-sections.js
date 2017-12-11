/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('Mutation.surveySections', () => {
  it('should fetch all surveySections', async () => {
    const db = {
      surveySections: [
        {
          id: 'surveySection1'
        },
        {
          id: 'surveySection2'
        }
      ]
    }
    const operation = `
      mutation {
        surveySections {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveySections: [
          {
            id: 'surveySection1'
          },
          {
            id: 'surveySection2'
          }
        ]
      }
    })
  })

  it('should return empty array if no matches', async () => {
    const db = {
      surveySections: []
    }
    const operation = `
      mutation {
        surveySections {
          id
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveySections: []
      }
    })
  })
})
