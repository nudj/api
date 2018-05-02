module.exports = {
  typeDefs: `
    type Referral {
      id: ID!
      slug: String!
      created: DateTime!
      modified: DateTime!
    }

    input ReferralFilterInput {
      id: ID
      slug: String
      person: ID
      job: ID
      dateTo: DateTime
      dateFrom: DateTime
    }
  `
}
