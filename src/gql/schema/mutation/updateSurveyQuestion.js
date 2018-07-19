const { values: tagTypes } = require('../enums/tag-types')
const { values: tagSources } = require('../enums/tag-sources')
const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      updateSurveyQuestion (id: ID!, data: SurveyQuestionUpdateInput!): SurveyQuestion
    }
  `,
  resolvers: {
    Mutation: {
      updateSurveyQuestion: async (root, args, context) => {
        const { tags, ...data } = args.data

        if (tags) {
          const oldSurveyQuestionTags = await context.sql.readAll({
            type: 'surveyQuestionTags',
            filters: { surveyQuestion: args.id }
          })

          await Promise.all(oldSurveyQuestionTags.map(tag => {
            return context.sql.delete({
              type: 'surveyQuestionTags',
              id: tag.id
            })
          }))

          const updatedTags = await Promise.all(tags.map(tag => {
            return context.sql.readOneOrCreate({
              type: 'tags',
              filters: {
                name: tag,
                type: tagTypes.EXPERTISE
              },
              data: {
                name: tag,
                type: tagTypes.EXPERTISE
              }
            })
          }))

          await Promise.all(updatedTags.map(tag => {
            return context.sql.readOneOrCreate({
              type: 'surveyQuestionTags',
              filters: {
                surveyQuestion: args.id,
                tag: tag.id,
                source: tagSources.NUDJ
              },
              data: {
                surveyQuestion: args.id,
                tag: tag.id,
                source: tagSources.NUDJ
              }
            })
          }))
        }

        if (data.title) {
          data.slug = await makeUniqueSlug({
            type: 'surveyQuestions',
            data: {
              ...data,
              id: args.id
            },
            context
          })
        }

        if (Object.keys(data).length) {
          return context.sql.update({
            type: 'surveyQuestions',
            id: args.id,
            data
          })
        } else {
          return context.sql.readOne({
            type: 'surveyQuestions',
            id: args.id
          })
        }
      }
    }
  }
}
