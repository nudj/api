module.exports = {
  typeDefs: `
    extend type Company {
      hirers: [Hirer!]!
    }
  `,
  resolvers: {
    Company: {
      hirers: (company, args, context) => {
        return context.transaction((store, params) => {
          const { company } = params
          return store.readAll({
            type: 'hirers',
            filters: { company }
          })
        }, {
          company: company.id
        })
      }
    }
  }
}
