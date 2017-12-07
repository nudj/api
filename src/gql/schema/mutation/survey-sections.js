module.exports = {
  typeDefs: `
    extend type Mutation {
      surveySections: [SurveySection!]!
    }
  `,
  resolvers: {
    Mutation: {
      surveySections: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'surveySections'
          })
        })
      }
    }
  }
}
