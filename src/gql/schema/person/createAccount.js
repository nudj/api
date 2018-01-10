module.exports = {
  typeDefs: `
    extend type Person {
      createAccount(type: AccountType!, data: Data!): Data
    }
  `,
  resolvers: {
    Person: {
      createAccount: (person, args, context) => {
        const { type, data } = args
        return context.transaction((store, params) => {
          const { person, type, data } = params
          return store.create({
            type: 'accounts',
            data: {
              person,
              type,
              ...data
            }
          })
        }, {
          type,
          data,
          person: person.id
        })
      }
    }
  }
}
