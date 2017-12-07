module.exports = {
  typeDefs: `
    extend type Mutation {
      employees: [Employee!]!
    }
  `,
  resolvers: {
    Mutation: {
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
