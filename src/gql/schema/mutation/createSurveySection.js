const makeUniqueSlug = require('../../lib/helpers/make-unique-slug')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurveySection(survey: ID!, data: SurveySectionCreateInput!): SurveySection
    }
  `,
  resolvers: {
    Mutation: {
      createSurveySection: async (root, args, context) => {
        const data = {
          ...args.data,
          survey: args.survey,
          surveyQuestions: JSON.stringify([])
        }
        const slug = await makeUniqueSlug({
          type: 'surveySections',
          data,
          context
        })
        const section = await context.sql.create({
          type: 'surveySections',
          data: {
            ...data,
            slug
          }
        })
        const { surveySections } = await context.sql.readOne({
          type: 'surveys',
          id: section.survey
        })
        let surveySectionsArray = JSON.parse(surveySections)
        surveySectionsArray = surveySectionsArray.concat(section.id)

        await context.sql.update({
          type: 'surveys',
          id: section.survey,
          data: {
            surveySections: JSON.stringify(surveySectionsArray)
          }
        })

        return Promise.resolve(section)
      }
    }
  }
}
