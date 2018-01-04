/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../gql/schema')
const {
  executeQueryOnDbUsingSchema,
  shouldRespondWithGqlError
} = require('../../helpers')

describe('Survey.surveySections', () => {
  it('should fetch filtered surveySections', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1',
          section: 'surveySections2'
        }
      ],
      surveySections: [
        {
          id: 'surveySections1'
        },
        {
          id: 'surveySections2'
        }
      ]
    }
    const operation = `
      query {
        survey (id: "survey1") {
          section {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        survey: {
          section: {
            id: 'surveySections2'
          }
        }
      }
    })
  })

  it('should return null and error if no matches', async () => {
    const db = {
      surveys: [
        {
          id: 'survey1',
          section: 'surveySections3'
        }
      ],
      surveySections: [
        {
          id: 'surveySections1'
        },
        {
          id: 'surveySections2'
        }
      ]
    }
    const operation = `
      query {
        survey (id: "survey1") {
          section {
            id
          }
        }
      }
    `
    return executeQueryOnDbUsingSchema({ operation, db, schema })
      .then(shouldRespondWithGqlError({
        message: 'NotFound',
        path: [
          'survey',
          'section'
        ]
      }))
  })
})
