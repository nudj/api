/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('SurveyQuestion.tags', () => {
  it('should fetch filtered tags', async () => {
    const db = {
      surveyQuestions: [
        {
          id: 'surveyQuestion1'
        }
      ],
      surveyQuestionTags: [
        {
          id: 'surveyQuestionTag1',
          surveyQuestion: 'surveyQuestion1',
          tag: 'tag1'
        },
        {
          id: 'surveyQuestionTag2',
          surveyQuestion: 'surveyQuestion2',
          tag: 'tag2'
        }
      ],
      tags: [
        {
          id: 'tag1',
          name: 'First'
        },
        {
          id: 'tag2',
          name: 'Second'
        }
      ]
    }
    const operation = `
      query {
        surveyQuestion (id: "surveyQuestion1") {
          tags {
            id
            name
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestion: {
          tags: [
            {
              id: 'tag1',
              name: 'First'
            }
          ]
        }
      }
    })
  })

  it('should return an empty array if no matches', async () => {
    const db = {
      surveyQuestions: [
        {
          id: 'surveyQuestion1'
        }
      ],
      surveyQuestionTags: [],
      tags: [
        {
          id: 'tag1',
          name: 'First'
        },
        {
          id: 'tag2',
          name: 'Second'
        }
      ]
    }
    const operation = `
      query {
        surveyQuestion (id: "surveyQuestion1") {
          tags {
            id
            name
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestion: {
          tags: []
        }
      }
    })
  })
})
