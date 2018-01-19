const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurveySection(survey: ID!, data: SurveySectionCreateInput!): SurveySection
    }
  `,
  resolvers: {
    Mutation: {
      createSurveySection: handleErrors((root, args, context) => {
        return context.transaction(
          (store, params) => {
            return store.create({
              type: 'surveySections',
              data: Object.assign({}, params.data, {
                survey: params.survey,
                surveyQuestions: []
              })
            })
            .then(section => {
              return store.readOne({
                type: 'surveys',
                id: section.survey
              })
              .then(survey => {
                const { surveySections = [] } = survey
                return store.update({
                  type: 'surveys',
                  id: section.survey,
                  data: {
                    surveySections: surveySections.concat(section.id)
                  }
                })
              })
              .then(() => Promise.resolve(section))
            })
          },
          {
            data: args.data,
            survey: args.survey
          }
        )
      })
    }
  }
}
