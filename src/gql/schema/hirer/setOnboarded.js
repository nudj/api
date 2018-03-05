module.exports = {
  typeDefs: `
    extend type Hirer {
      setOnboarded: Boolean!
    }
  `,
  resolvers: {
    Hirer: {
      setOnboarded: async (hirer, args, context) => {
        const updatedHirer = await context.store.update({
          type: 'hirers',
          id: hirer.id,
          data: {
            onboarded: true
          }
        })

        return updatedHirer.onboarded
      }
    }
  }
}
