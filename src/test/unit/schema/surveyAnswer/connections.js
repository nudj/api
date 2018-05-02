/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')
const { values: tagTypes } = require('../../../../gql/schema/enums/tag-types')

describe('SurveyAnswer.connections', () => {
  it('should fetch filtered connections', async () => {
    const db = {
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
      surveyQuestions: [
        {
          id: 'surveyQuestion1'
        }
      ],
      surveyAnswers: [
        {
          id: 'surveyAnswer1',
          surveyQuestion: 'surveyQuestion1',
          connections: [ 'connection1', 'connection2' ]
        }
      ],
      surveyAnswerConnections: [
        {
          id: 'surveyAnswerConnection1',
          surveyAnswer: 'surveyAnswer1',
          connection: 'connection1'
        },
        {
          id: 'surveyAnswerConnection2',
          surveyAnswer: 'surveyAnswer1',
          connection: 'connection2'
        }
      ],
      surveyQuestionTags: [],
      roleTags: [],
      tags: []
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
      surveyAnswerConnections: [],
      surveyAnswers: [
        {
          id: 'surveyAnswer1',
          surveyQuestion: 'surveyQuestion1'
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
        surveyQuestionTags: []
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
            surveyQuestion: 'surveyQuestion1'
          }
        ],
        surveyAnswerConnections: [
          {
            id: 'surveyAnswerConnection1',
            surveyAnswer: 'surveyAnswer1',
            connection: 'connection1'
          },
          {
            id: 'surveyAnswerConnection2',
            surveyAnswer: 'surveyAnswer1',
            connection: 'connection2'
          }
        ],
        connections: [
          {
            id: 'connection1',
            role: 'role1'
          },
          {
            id: 'connection2',
            role: 'role2'
          },
          {
            id: 'connection3',
            role: 'role1'
          }
        ],
        surveyQuestions: [{
          id: 'surveyQuestion1'
        }],
        surveyQuestionTags: [{
          id: 'et1',
          surveyQuestion: 'surveyQuestion1',
          tag: 'tag1'
        }],
        tags: [
          {
            id: 'tag1',
            type: tagTypes.EXPTERISE,
            name: 'Lord'
          },
          {
            id: 'tag2',
            type: tagTypes.EXPERTISE,
            name: 'Admiral'
          },
          {
            id: 'tag3',
            type: tagTypes.EXPERTISE,
            name: 'Baron'
          },
          {
            id: 'tag4',
            type: tagTypes.EXPERTISE,
            name: 'Viscount'
          }
        ],
        roleTags: [
          {
            id: 'roleTag1',
            role: 'role1',
            tag: 'tag2'
          },
          {
            id: 'roleTag2',
            role: 'role2',
            tag: 'tag3'
          },
          {
            id: 'roleTag3',
            role: 'role2',
            tag: 'tag4'
          }
        ]
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
            connections: [
              {
                id: 'connection1',
                tags: [
                  {
                    id: 'tag1'
                  },
                  {
                    id: 'tag2'
                  }
                ]
              },
              {
                id: 'connection2',
                tags: [
                  {
                    id: 'tag1'
                  },
                  {
                    id: 'tag3'
                  },
                  {
                    id: 'tag4'
                  }
                ]
              }
            ]
          }
        }
      })
    })
  })
})
