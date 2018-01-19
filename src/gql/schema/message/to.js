const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Message {
      to: Person!
    }
  `,
  resolvers: {
    Message: {
      to: handleErrors(async (message, args, context) => {
        const { to } = message
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
        }, { id: to })
      })
    }
  }
}
