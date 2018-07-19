const uniq = require('lodash/uniq')
const union = require('lodash/union')

const fetchRoleToTagsMap = require('../../lib/helpers/fetch-role-tag-maps')

module.exports = {
  typeDefs: `
    extend type SurveyAnswer {
      connections: [Connection!]!
    }
  `,
  resolvers: {
    SurveyAnswer: {
      connections: async (surveyAnswer, args, context) => {
        const surveyAnswerConnections = await context.sql.readAll({
          type: 'surveyAnswerConnections',
          filters: {
            surveyAnswer: surveyAnswer.id
          }
        })
        const connections = await context.sql.readMany({
          type: 'connections',
          ids: surveyAnswerConnections.map(item => item.connection)
        })

        if (!connections.length) return connections

        const rolesToTagsMap = await fetchRoleToTagsMap(context)
        const surveyQuestionTags = await context.sql.readAll({
          type: 'surveyQuestionTags',
          filters: { surveyQuestion: surveyAnswer.surveyQuestion }
        })

        const tags = await context.sql.readMany({
          type: 'tags',
          ids: uniq(surveyQuestionTags.map(surveyQuestionTag => surveyQuestionTag.tag))
        })

        return connections.map(async connection => ({
          ...connection,
          tags: union(tags, rolesToTagsMap[connection.role])
        }))
      }
    }
  }
}
