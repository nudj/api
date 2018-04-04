/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

describe('SurveyAnswer.connections', () => {
  it('should fetch filtered connections', async () => {
    const db = {
      surveyAnswers: [
        {
          id: 'surveyAnswer1',
          surveyQuestion: 'surveyQuestion1',
          connections: [ 'connection1', 'connection2' ]
        }
      ],
      connections: [
        {
          id: 'connection1'
        },
        {
          id: 'connection2'
        },
        {
          id: 'connection3'
        }
      ],
      surveyQuestions: [{
        id: 'surveyQuestion1',
        entityTags: []
      }]
    }
    const operation = `
      query {
        surveyAnswer (id: "surveyAnswer1") {
          connections {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyAnswer: {
          connections: [
            {
              id: 'connection1'
            },
            {
              id: 'connection2'
            }
          ]
        }
      }
    })
  })

  it('should return null if no matches', async () => {
    const db = {
      surveyAnswers: [
        {
          id: 'surveyAnswer1',
          surveyQuestion: 'surveyQuestion1',
          connections: [ 'connection3' ]
        }
      ],
      connections: [
        {
          id: 'connection1'
        },
        {
          id: 'connection2'
        }
      ],
      surveyQuestions: [{
        id: 'surveyQuestion1',
        entityTags: []
      }]
    }
    const operation = `
      query {
        surveyAnswer (id: "surveyAnswer1") {
          connections {
            id
          }
        }
      }
    `
    return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
      data: {
        surveyAnswer: {
          connections: []
        }
      }
    })
  })

  describe('when requesting a connection with tags', () => {
    it('should the return the connections tags', async () => {
      const db = {
        surveyAnswers: [
          {
            id: 'surveyAnswer1',
            surveyQuestion: 'surveyQuestion1',
            connections: [ 'connection1', 'connection2' ]
          }
        ],
        connections: [
          {
            id: 'connection1'
          },
          {
            id: 'connection2'
          },
          {
            id: 'connection3'
          }
        ],
        surveyQuestions: [{
          id: 'surveyQuestion1'
        }],
        entityTags: [{
          id: 'et1',
          entityId: 'surveyQuestion1',
          entityType: 'surveyQuestion',
          tagId: 'tag1'
        }],
        tags: [{
          id: 'tag1',
          type: 'EXPTERISE',
          name: 'Lord Timmeny'
        }]
      }
      const operation = `
        query {
          surveyAnswer (id: "surveyAnswer1") {
            connections {
              id
              tags {
                id
              }
            }
          }
        }
      `
      return expect(executeQueryOnDbUsingSchema({ operation, db, schema })).to.eventually.deep.equal({
        data: {
          surveyAnswer: {
            connections: [{
              id: 'connection1',
              tags: [{
                id: 'tag1'
              }]
            }, {
              id: 'connection2',
              tags: [{
                id: 'tag1'
              }]
            }]
          }
        }
      })
    })
  })
})
