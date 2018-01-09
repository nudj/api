module.exports = {
  typeDefs: `
    extend type Person {
      verifyGoogleAuthentication: Boolean
    }
  `,
  resolvers: {
    Person: {
      verifyGoogleAuthentication: (person, args, context) => {
        return context.transaction((store, params) => {
          return store.readOne({
            type: 'accounts',
            filters: params.filters
          }).then(account => {
            if (!account || !account.refreshToken) return false
            return true
          })
        }, {
          filters: {
            person: person.id
          }
        })
      }
    }
  }
}
