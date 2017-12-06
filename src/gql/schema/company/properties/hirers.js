module.exports = {
  typeDef: `
    extend type Company {
      hirers: [Hirer!]!
    }
  `,
  resolver: (company, args, context) => {
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
