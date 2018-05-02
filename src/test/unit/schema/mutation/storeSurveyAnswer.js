/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect

const schema = require('../../../../gql/schema')
const { executeQueryOnDbUsingSchema } = require('../../helpers')

const operation = `
  mutation {
    storeSurveyAnswer (
      surveyQuestion: "surveyQuestion1"
      person: "person1"
      connections: [
        "connection1",
        "connection2"
      ]
    ) {
      id
      person {
        id
      }
    }
  }
`

describe('Mutation.storeSurveyAnswer', () => {
  let db

  describe('when new surveyAnswer', () => {
    beforeEach(() => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        surveyAnswers: [],
        surveyAnswerConnections: []
      }
    })

    it('should create surveyAnswer', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.surveyAnswers[0]).to.deep.equal({
        id: 'surveyAnswer1',
        person: 'person1',
        surveyQuestion: 'surveyQuestion1'
      })
    })

    it('should create surveyAnswerConnections', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.surveyAnswerConnections).to.have.length(2)
      expect(db.surveyAnswerConnections[0]).to.deep.equal({
        id: 'surveyAnswerConnection1',
        surveyAnswer: 'surveyAnswer1',
        connection: 'connection1'
      })
      expect(db.surveyAnswerConnections[1]).to.deep.equal({
        id: 'surveyAnswerConnection2',
        surveyAnswer: 'surveyAnswer1',
        connection: 'connection2'
      })
    })

    it('should return created value', async () => {
      const result = await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(result).to.deep.equal({
        data: {
          storeSurveyAnswer: {
            id: 'surveyAnswer1',
            person: {
              id: 'person1'
            }
          }
        }
      })
    })
  })

  describe('when existing surveyAnswer', () => {
    beforeEach(() => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        surveyAnswers: [
          {
            id: 'surveyAnswer1',
            person: 'person1',
            surveyQuestion: 'surveyQuestion1'
          }
        ],
        surveyAnswerConnections: []
      }
    })

    it('should not create surveyAnswer', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.surveyAnswers).to.have.length(1)
      expect(db.surveyAnswers[0]).to.deep.equal({
        id: 'surveyAnswer1',
        person: 'person1',
        surveyQuestion: 'surveyQuestion1'
      })
    })
  })

  describe('when existing surveyAnswerConnections', () => {
    beforeEach(() => {
      db = {
        people: [
          {
            id: 'person1'
          }
        ],
        surveyAnswers: [
          {
            id: 'surveyAnswer1',
            person: 'person1',
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
            connection: 'connection3'
          }
        ]
      }
    })

    it('should update db with latest surveyAnswerConnections', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.surveyAnswerConnections).to.have.length(2)
    })

    it('should remove those which do not exist in latest connection answers', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.surveyAnswerConnections.some(answer => answer.connection === 'connection3')).to.be.false()
    })

    it('should add those which do not exist in existing connection answers', async () => {
      await executeQueryOnDbUsingSchema({ operation, db, schema })
      expect(db.surveyAnswerConnections.some(answer => answer.connection === 'connection2')).to.be.true()
    })
  })
})
