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
          type: 'people',
          id: from
        })
        .then(person => {
          if (!person) throw new Error('No message.from found')
          return person
        })
      })
    }
  }
}
