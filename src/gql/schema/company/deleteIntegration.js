const { values: hirerTypes } = require('../../schema/enums/hirer-types')

module.exports = {
  typeDefs: `
    extend type Company {
      deleteIntegration(id: ID!): CompanyIntegration
    }
  `,
  resolvers: {
    Company: {
      deleteIntegration: async (company, args, context) => {
        const [ userHirer, integration ] = await Promise.all([
          context.store.readOne({
            type: 'hirers',
            filters: { person: context.userId }
          }),
          context.store.readOne({
            type: 'companyIntegrations',
            id: args.id
          })
        ])

        if (integration.company !== company.id) {
          throw new Error('Cannot delete integrations from other companies')
        }
        if (!userHirer || userHirer.type !== hirerTypes.ADMIN) {
          throw new Error('User does not have permission to delete integrations')
        }

        return context.store.delete({
          type: 'companyIntegrations',
          id: args.id
        })
      }
    }
  }
}
