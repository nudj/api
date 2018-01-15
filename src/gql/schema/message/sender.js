const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Message {
      sender: Person!
    }
  `,
  resolvers: {
    Message: {
      sender: handleErrors(async (message, args, context) => {
        const { sender } = message
        return await context.transaction((store, params) => {
          const { id } = params
          return store.readOne({
            type: 'people',
            id
          })
          .then(person => {
            if (!person) throw new Error('No message sender found')
            return person
          })
        }, { id: sender })
      })
    }
  }
}
