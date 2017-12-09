module.exports = {
  typeDefs: `
    type Referral {
      id: ID!
      created: DateTime!
      modified: DateTime!
    }

    input ReferralFilterInput {
      id: ID
    }
  `
}
