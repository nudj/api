module.exports = {
  typeDefs: `
    extend type Hirer {
      setOnboarded: Boolean!
    }
  `,
  resolvers: {
    Hirer: {
      setOnboarded: (hirer, args, context) => {
        return context.transaction((store, params) => {
          return store.update({
            type: 'hirers',
            id: params.id,
            data: {
              onboarded: true
            }
          })
          .then(hirer => hirer.onboarded)
        }, {
          id: hirer.id
        })
      }
    }
  }
}
