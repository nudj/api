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
        return context.store.readOne({
          type: 'accounts',
          filters: {
            person: person.id,
            type: 'GOOGLE'
          }
        })
        .then(account => !!(account && account.data && account.data.refreshToken))
        .catch(error => {
          if (error.constructor === NotFound) return false
          throw error
        })
      }
    }
  }
}
