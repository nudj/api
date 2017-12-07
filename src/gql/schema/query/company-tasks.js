module.exports = {
  typeDefs: `
    extend type Query {
      companyTasks: [CompanyTask!]!
    }
  `,
  resolvers: {
    Query: {
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
