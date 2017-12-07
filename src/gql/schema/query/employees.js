module.exports = {
  typeDefs: `
    extend type Query {
      employees: [Employee!]!
    }
  `,
  resolvers: {
    Query: {
      employees: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'employees'
          })
        })
      }
    }
  }
}
