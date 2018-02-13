const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Message {
      from: Person!
    }
  `,
  resolvers: {
    Message: {
      from: handleErrors((message, args, context) => {
        const { from } = message
        return context.store.readOne({
          type: 'accounts',
          filters: { email: from }
        })
        .then(account => context.store.readOne({
          type: 'people',
          filters: account ? undefined : { email: from },
          id: account && account.person
        }))
      })
    }
  }
}
