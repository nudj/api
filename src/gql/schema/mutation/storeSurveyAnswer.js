const difference = require('lodash/difference')

module.exports = {
  typeDefs: `
    extend type Mutation {
      storeSurveyAnswer(surveyQuestion: ID! person: ID! connections: [ID!]!): SurveyAnswer
    }
  `,
  resolvers: {
    Mutation: {
      storeSurveyAnswer: async (root, args, context) => {
        const {
          surveyQuestion: surveyQuestionId,
          person: personId,
          connections: latestConnectionIds
        } = args

        let existingConnections = []
        let surveyAnswer = await context.sql.readOne({
          type: 'surveyAnswers',
          filters: {
            surveyQuestion: surveyQuestionId,
            person: personId
          }
        })

        if (!surveyAnswer) {
          surveyAnswer = await context.sql.create({
            type: 'surveyAnswers',
            data: {
              surveyQuestion: surveyQuestionId,
              person: personId
            }
          })
        } else {
          existingConnections = await context.sql.readAll({
            type: 'surveyAnswerConnections',
            filters: {
              surveyAnswer: surveyAnswer.id
            }
          })
        }

        const existingConnectionIds = existingConnections.map(c => c.connection)
        const connectionsToAdd = difference(latestConnectionIds, existingConnectionIds)
        const connectionsToRemove = difference(existingConnectionIds, latestConnectionIds)
        await Promise.all([
          Promise.all(connectionsToAdd.map(connection => {
            return context.sql.create({
              type: 'surveyAnswerConnections',
              data: {
                surveyAnswer: surveyAnswer.id,
                connection
              }
            })
          })),
          Promise.all(connectionsToRemove.map(async connectionId => {
            const surveyAnswerConnection = await context.sql.readOne({
              type: 'surveyAnswerConnections',
              filters: {
                surveyAnswer: surveyAnswer.id,
                connection: connectionId
              }
            })
            return context.sql.delete({
              type: 'surveyAnswerConnections',
              id: surveyAnswerConnection.id
            })
          }))
        ])

        return surveyAnswer
      }
    }
  }
}
