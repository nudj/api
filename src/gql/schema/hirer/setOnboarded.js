const isNil = require('lodash/isNil')

module.exports = {
  typeDefs: `
    extend type Hirer {
      setOnboarded(onboard: Boolean): Boolean
    }
  `,
  resolvers: {
    Hirer: {
      setOnboarded: async (hirer, args, context) => {
        const onboard = isNil(args.onboard) ? true : args.onboard

        const updatedHirer = await context.store.update({
          type: 'hirers',
          id: hirer.id,
          data: {
            onboarded: onboard
          }
        })

        return updatedHirer.onboarded
      }
    }
  }
}
