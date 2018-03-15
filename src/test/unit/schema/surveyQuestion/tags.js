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
          id: 'surveyQuestion1',
          tags: [
            'entityTag1',
            'entityTag2'
          ]
        }
      ],
      entityTags: [
        {
          id: 'entityTag1',
          tagId: 'tag1'
        },
        {
          id: 'entityTag2',
          tagId: 'tag2'
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
          tags
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyQuestion: {
          tags: [
            'First',
            'Second'
          ]
        }
      }
    })
  })

  it('should return an empty array if no matches', async () => {
    const db = {
      surveyQuestions: [
        {
          id: 'surveyQuestion1',
          tags: [
            'entityTag1',
            'entityTag2'
          ]
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
          tags
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