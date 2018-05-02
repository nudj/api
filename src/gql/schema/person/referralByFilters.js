module.exports = {
  typeDefs: `
    extend type Person {
      referralByFilters(filters: ReferralFilterInput!): Referral
    }
  `,
  resolvers: {
    Person: {
      referralByFilters: (person, args, context) => {
        return context.sql.readOne({
          type: 'referrals',
          filters: {
            ...args.filters,
            person: person.id
          }
        })
      }
    }
  }
}
