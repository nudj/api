module.exports = {
  typeDefs: `
    extend type Person {
      referralByFilters(filters: ReferralFilterInput!): Referral
    }
  `,
  resolvers: {
    Person: {
      referralByFilters: (person, args, context) => {
        return context.transaction((store, params) => {
          const { person, filters } = params
          return store.readOne({
            type: 'referrals',
            filters: Object.assign({}, filters, { person })
          })
        }, {
          person: person.id,
          filters: args.filters
        })
      }
    }
  }
}
