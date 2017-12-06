module.exports = {
  typeDefs: `
    extend type Mutation {
      referrals: [Referral!]!
    }
  `,
  resolvers: {
    Mutation: {
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
