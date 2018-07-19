module.exports = {
  typeDefs: `
    extend type Mutation {
      updateCompany(
        id: ID!,
        companyUpdate: CompanyUpdateInput!
      ): Company
    }
  `,
  resolvers: {
    Mutation: {
      updateCompany: async (person, args, context) => {
        const { id, companyUpdate } = args
        const { slug } = companyUpdate

        if (slug) {
          const fetchedCompany = await context.store.readOne({
            type: 'companies',
            filters: { slug }
          })
          if (fetchedCompany.id !== id) {
            throw new Error(`Company with slug '${slug}' already exists`)
          }
        }

        return context.store.update({
          type: 'companies',
          id,
          data: companyUpdate
        })
      }
    }
  }
}
