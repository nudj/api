const uniq = require('lodash/uniq')
const union = require('lodash/union')

const handleErrors = require('../../lib/handle-errors')
const fetchRoleToTagsMap = require('../../lib/helpers/fetch-role-tag-maps')

module.exports = {
  typeDefs: `
    extend type SurveyAnswer {
      connections: [Connection!]!
    }
  `,
  resolvers: {
    SurveyAnswer: {
      connections: handleErrors(async (answer, args, context) => {
        const connections = await context.store.readMany({
          type: 'connections',
          ids: answer.connections
        })

        if (!connections.length) return connections

        const rolesToTagsMap = await fetchRoleToTagsMap(context)
        const surveyQuestionTags = await context.store.readAll({
          type: 'surveyQuestionTags',
          filters: { surveyQuestion: answer.surveyQuestion }
        })

        const tags = await context.store.readMany({
          type: 'tags',
          ids: uniq(surveyQuestionTags.map(surveyQuestionTag => surveyQuestionTag.tag))
        })

        return connections.map(async connection => ({
          ...connection,
          tags: union(tags, rolesToTagsMap[connection.role])
        }))
      })
    }
  }
}
