const { NotFound } = require('@nudj/library/errors')

module.exports = {
  typeDefs: `
    extend type Person {
      verifyGoogleAuthentication: Boolean
    }
  `,
  resolvers: {
    Person: {
      verifyGoogleAuthentication: async (person, args, context) => {
        try {
          const account = await context.sql.readOne({
            type: 'accounts',
            filters: {
              person: person.id,
              type: 'GOOGLE'
            }
          })
          return !!(account && account.data && JSON.parse(account.data).refreshToken)
        } catch (error) {
          if (error.constructor === NotFound) return false
          throw error
        }
      }
    }
  }
}
