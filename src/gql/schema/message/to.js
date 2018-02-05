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
        return context.store.readOne({
          type: 'people',
          id: to
        })
        .then(person => {
          if (!person) throw new Error('No message recipient found')
          return person
        })
      })
    }
  }
}
