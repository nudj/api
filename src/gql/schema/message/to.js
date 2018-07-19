module.exports = {
  typeDefs: `
    extend type Message {
      to: Person!
    }
  `,
  resolvers: {
    Message: {
      to: (message, args, context) => {
        const { to } = message
        return context.store.readOne({
          type: 'accounts',
          filters: { emailAddress: to }
        })
        .then(account => context.store.readOne({
          type: 'people',
          filters: account ? undefined : { email: to },
          id: account && account.person
        }))
      }
    }
  }
}
