const isNil = require('lodash/isNil')
const updateIntercomTagsForHirer = require('../../lib/intercom/update-tags-for-hirer')

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

        const updatedHirer = await context.sql.update({
          type: 'hirers',
          id: hirer.id,
          data: {
            onboarded: onboard
          }
        })
        await updateIntercomTagsForHirer(context, updatedHirer)

        return updatedHirer.onboarded
      }
    }
  }
}
