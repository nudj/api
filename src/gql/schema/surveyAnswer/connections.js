const uniq = require('lodash/uniq')

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
        const question = await context.store.readOne({
          type: 'surveyQuestions',
          id: answer.surveyQuestion
        })

        const connections = await context.store.readMany({
          type: 'connections',
          ids: answer.connections
        })

        if (connections.length) {
          const entityTags = await context.store.readAll({
            type: 'entityTags',
            filters: {
              entityType: 'surveyQuestion',
              entityId: question.id
            }
          })

          if (entityTags.length) {
            const tagIds = uniq(entityTags.map(entityTag => entityTag.tagId))
            const tags = await context.store.readMany({
              type: 'tags',
              ids: tagIds
            })

            return connections.map(connection => ({
              ...connection,
              tags
            }))
          }
        }

        return connections
      })
    }
  }
}
