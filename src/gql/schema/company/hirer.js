module.exports = {
  typeDefs: `
    extend type Company {
      hirer ( id: ID! ): Hirer
    }
  `,
  resolvers: {
    Company: {
      hirer: async (company, args, context) => {
        const { id } = args
        const hirer = await context.sql.readOne({
          type: 'hirers',
          id
        })
        if (hirer && hirer.company !== company.id) return null
        return hirer
      }
    }
  }
}
