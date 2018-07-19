module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurveySection(survey: ID!, data: SurveySectionCreateInput!): SurveySection
    }
  `,
  resolvers: {
    Mutation: {
      createSurveySection: async (root, args, context) => {
        const section = await context.store.create({
          type: 'surveySections',
          data: {
            ...args.data,
            survey: args.survey,
            surveyQuestions: []
          }
        })
        const { surveySections = [] } = await context.store.readOne({
          type: 'surveys',
          id: section.survey
        })

        await context.store.update({
          type: 'surveys',
          id: section.survey,
          data: {
            surveySections: surveySections.concat(section.id)
          }
        })

        return Promise.resolve(section)
      }
    }
  }
}
