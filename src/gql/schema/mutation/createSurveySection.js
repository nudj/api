const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurveySection(survey: ID!, data: SurveySectionCreateInput!): SurveySection
    }
  `,
  resolvers: {
    Mutation: {
      createSurveySection: handleErrors(async (root, args, context) => {
        const section = await context.sql.create({
          type: 'surveySections',
          data: {
            ...args.data,
            survey: args.survey,
            surveyQuestions: []
          }
        })
        const { surveySections = [] } = await context.sql.readOne({
          type: 'surveys',
          id: section.survey
        })

        await context.sql.update({
          type: 'surveys',
          id: section.survey,
          data: {
            surveySections: surveySections.concat(section.id)
          }
        })

        return Promise.resolve(section)
      })
    }
  }
}
