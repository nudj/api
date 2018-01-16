const { handleErrors } = require('../../lib')

module.exports = {
  typeDefs: `
    extend type Message {
      from: Person!
    }
  `,
  resolvers: {
    Message: {
      from: handleErrors(async (message, args, context) => {
        const { from } = message
        return await context.transaction((store, params) => {
          const { id } = params
          return store.readOne({
            type: 'people',
            id
          })
          .then(person => {
            if (!person) throw new Error('No message from found')
            return person
          })
        }, { id: from })
      })
    }
  }
}
