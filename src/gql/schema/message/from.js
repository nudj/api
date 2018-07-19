module.exports = {
  typeDefs: `
    extend type Message {
      from: Person!
    }
  `,
  resolvers: {
    Message: {
      from: (message, args, context) => {
        const { from } = message
        return context.store.readOne({
          type: 'accounts',
          filters: { emailAddress: from }
        })
        .then(account => context.store.readOne({
          type: 'people',
          filters: account ? undefined : { email: from },
          id: account && account.person
        }))
      }
    }
  }
}
