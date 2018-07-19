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
        return context.sql.readOne({
          type: 'accounts',
          filters: { email: from }
        })
          .then(account => context.sql.readOne({
            type: 'people',
            filters: account ? undefined : { email: from },
            id: account && account.person
          }))
      }
    }
  }
}
