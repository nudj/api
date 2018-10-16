const { values: hirerTypes } = require('../../schema/enums/hirer-types')

module.exports = {
  typeDefs: `
    extend type Company {
      deleteHirer(id: ID!): Hirer
    }
  `,
  resolvers: {
    Company: {
      deleteHirer: async (company, args, context) => {
        const [ userHirer, hirer ] = await Promise.all([
          context.store.readOne({
            type: 'hirers',
            filters: {
              company: company.id,
              person: context.userId
            }
          }),
          context.store.readOne({
            type: 'hirers',
            id: args.id
          })
        ])

        if (hirer.company !== company.id) {
          throw new Error('Cannot delete hirers from other companies')
        }
        if (!userHirer || userHirer.type !== hirerTypes.ADMIN) {
          throw new Error('User does not have permission to delete teammates')
        }
        if (userHirer.id === args.id) {
          throw new Error('Cannot delete self')
        }

        return context.store.delete({
          type: 'hirers',
          id: args.id
        })
      }
    }
  }
}
