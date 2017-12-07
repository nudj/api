module.exports = {
  typeDefs: `
    extend type Mutation {
      companyTasks: [CompanyTask!]!
    }
  `,
  resolvers: {
    Mutation: {
      companyTasks: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'companyTasks'
          })
        })
      }
    }
  }
}
