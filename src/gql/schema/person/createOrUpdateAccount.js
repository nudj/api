module.exports = {
  typeDefs: `
    extend type Person {
      createOrUpdateAccount(type: AccountType!, data: Data!): Account!
    }
  `,
  resolvers: {
    Person: {
      createOrUpdateAccount: async (person, args, context) => {
        const { type, data } = args
        const account = await context.store.readOne({
          type: 'accounts',
          filters: {
            person: person.id,
            type
          }
        })
        if (account && account.id) {
          return context.store.update({
            type: 'accounts',
            id: account.id,
            data: Object.assign({}, account, data)
          })
        }
        return context.store.create({
          type: 'accounts',
          data: {
            person: person.id,
            type,
            ...data
          }
        })
      }
    }
  }
}
