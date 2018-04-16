const uniq = require('lodash/uniq')
const union = require('lodash/union')

const handleErrors = require('../../lib/handle-errors')

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

        return connections.map(async connection => {
          const tags = await context.store.readAll({
            type: 'roleTags',
            filters: { entityId: connection.role }
          })

          const roleTags = await context.store.readMany({
            type: 'tags',
            ids: tags.map(roleTag => roleTag.tagId)
          })

          return {
            ...connection,
            tags: union(surveyQuestionTags, roleTags)
          }
        })
      })
    }
  }
}
