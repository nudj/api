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

        const entityTags = await context.store.readAll({
          type: 'entityTags',
          filters: {
            entityType: 'surveyQuestion',
            entityId: answer.surveyQuestion
          }
        })

        const tagIds = uniq(entityTags.map(entityTag => entityTag.tagId))
        const surveyQuestionTags = await context.store.readMany({
          type: 'tags',
          ids: tagIds
        })

        const rolesToTagsMap = await fetchRoleToTagsMap(context)

        return connections.map(async connection => ({
          ...connection,
          tags: union(surveyQuestionTags, rolesToTagsMap[connection.role])
        }))
      })
    }
  }
}
