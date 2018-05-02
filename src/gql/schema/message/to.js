const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Message {
      to: Person!
    }
  `,
  resolvers: {
    Message: {
      to: handleErrors((message, args, context) => {
        const { to } = message
        return context.sql.readOne({
          type: 'accounts',
          filters: { email: to }
        })
          .then(account => context.sql.readOne({
            type: 'people',
            filters: account ? undefined : { email: to },
            id: account && account.person
          }))
      })
    }
  }
}
