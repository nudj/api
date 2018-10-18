const updateIntercomTagsForHirer = require('../../lib/intercom/update-tags-for-hirer')

module.exports = {
  typeDefs: `
    extend type Hirer {
      updateType(type: HirerType!): HirerType
    }
  `,
  resolvers: {
    Hirer: {
      updateType: async (hirer, args, context) => {
        const updatedHirer = await context.store.update({
          type: 'hirers',
          id: hirer.id,
          data: {
            type: args.type
          }
        })
        await updateIntercomTagsForHirer(context, updatedHirer)
        return args.type
      }
    }
  }
}
