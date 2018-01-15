const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Message {
      recipient: Person!
    }
  `,
  resolvers: {
    Message: {
      recipient: handleErrors(async (message, args, context) => {
        const { recipient } = message
        return await context.transaction((store, params) => {
          const { id } = params
          return store.readOne({
            type: 'people',
            id
          })
          .then(person => {
            if (!person) throw new Error('No message recipient found')
            return person
          })
        }, { id: recipient })
      })
    }
  }
}
