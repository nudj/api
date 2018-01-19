const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Mutation {
      createSurveyQuestion(surveySection: ID!, data: SurveyQuestionCreateInput!): Survey
    }
  `,
  resolvers: {
    Mutation: {
      createSurveyQuestion: handleErrors((root, args, context) => {
        return context.transaction(
          (store, params) => {
            return store.create({
              type: 'surveyQuestions',
              data: Object.assign({}, params.data, {
                surveySection: params.surveySection
              })
            })
            .then(question => {
              return store.readOne({
                type: 'surveySections',
                id: question.surveySection
              })
              .then(section => {
                const { surveyQuestions = [] } = section
                return store.update({
                  type: 'surveySections',
                  id: question.surveySection,
                  data: {
                    surveyQuestions: surveyQuestions.concat(question.id)
                  }
                })
              })
              .then(() => Promise.resolve(question))
            })
          },
          {
            data: args.data,
            surveySection: args.surveySection
          }
        )
      })
    }
  }
}
