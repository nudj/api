module.exports = {
  typeDefs: `
    extend type Query {
      referrals: [Referral!]!
    }
  `,
  resolvers: {
    Query: {
      referrals: (root, args, context) => {
        return context.transaction((store) => {
          return store.readAll({
            type: 'referrals'
          })
        })
      }
    }
  }
}
