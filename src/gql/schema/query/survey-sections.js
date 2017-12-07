module.exports = {
  typeDefs: `
    extend type Query {
      surveySections: [SurveySection!]!
    }
  `,
  resolvers: {
    Query: {
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
