const { NotFound } = require('@nudj/library/errors')

module.exports = {
  typeDefs: `
    extend type Person {
      verifyGoogleAuthentication: Boolean
    }
  `,
  resolvers: {
    Person: {
      verifyGoogleAuthentication: (person, args, context) => {
        return context.transaction(async (store, params) => {
          try {
            const account = await store.readOne({
              type: 'accounts',
              filters: params.filters
            })
            return !!account.refreshToken
          } catch (error) {
            if (error.constructor === NotFound) return false
            throw error
          }
        }, {
          filters: {
            person: person.id,
            type: 'GOOGLE'
          }
        })
      }
    }
  }
}